import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {PeopleService} from './people.service'

interface TimelineEvent {
  gramps_id: string
  date: string
  age?: string
  label: string
  description?: string
  role?: string
  place?: {
    name: string
    lat?: number
    long?: number
  }
  person?: {
    name_given?: string
    name_surname?: string
  }
  historical?: boolean
  type?: string
}

interface HistoricalEvent {
  year: number
  date: string
  title: string
  description: string
  category: string
}

@Injectable()
export class TimelineService {
  constructor(
    private prisma: PrismaService,
    private peopleService: PeopleService,
  ) {}

  /**
   * Get timeline events for a person, including their life events and historical context
   */
  async getPersonTimeline(
    handle: string,
    locale = 'en',
  ): Promise<{data: TimelineEvent[]}> {
    // Verify person exists
    const person = await this.peopleService.findOne(handle)

    const events: TimelineEvent[] = []

    // Add birth event if available
    if (person.birth_date) {
      events.push({
        gramps_id: `${handle}_birth`,
        date: this.formatDate(person.birth_date, locale),
        age: '',
        label: 'Birth',
        description: '',
        place: person.birth_place
          ? {name: person.birth_place}
          : undefined,
        type: 'birth',
      })
    }

    // Add death event if available
    if (person.death_date) {
      const age = this.calculateAge(person.birth_date, person.death_date)
      events.push({
        gramps_id: `${handle}_death`,
        date: this.formatDate(person.death_date, locale),
        age: age ? `Age ${age}` : '',
        label: 'Death',
        description: '',
        place: person.death_place
          ? {name: person.death_place}
          : undefined,
        type: 'death',
      })
    }

    // Get events from database
    const dbEvents = await this.prisma.event.findMany({
      where: {personHandle: handle},
      orderBy: {date: 'asc'},
    })

    // Add database events to timeline
    for (const event of dbEvents) {
      const age = this.calculateAge(person.birth_date, event.date)
      events.push({
        gramps_id: event.grampsId,
        date: this.formatDate(event.date || '', locale),
        age: age ? `Age ${age}` : '',
        label: event.type,
        description: event.description || '',
        place: event.place ? JSON.parse(event.place) : undefined,
        type: event.type.toLowerCase(),
      })
    }

    // Add historical context events
    const birthYear = this.extractYear(person.birth_date)
    const deathYear = this.extractYear(person.death_date)
    if (birthYear) {
      const historicalEvents = this.getHistoricalEvents(
        birthYear,
        deathYear || new Date().getFullYear(),
      )
      events.push(...historicalEvents)
    }

    // Sort all events by date
    events.sort((a, b) => {
      const dateA = this.parseDateForSort(a.date)
      const dateB = this.parseDateForSort(b.date)
      return dateA - dateB
    })

    return {data: events}
  }

  /**
   * Get comparative timeline for multiple people
   */
  async getComparativeTimeline(handles: string[]): Promise<{data: any[]}> {
    const timelines = []

    for (const handle of handles) {
      const person = await this.peopleService.findOne(handle)
      const timeline = await this.getPersonTimeline(handle)

      timelines.push({
        person: {
          handle: person.handle,
          gramps_id: person.gramps_id,
          name: `${person.first_name || ''} ${person.surname || ''}`.trim(),
          birth_date: person.birth_date,
          death_date: person.death_date,
        },
        events: timeline.data,
      })
    }

    return {data: timelines}
  }

  /**
   * Get age analysis data for a person or group of people
   */
  async getAgeAnalysis(handles?: string[]): Promise<{data: any}> {
    let where = {}
    if (handles && handles.length > 0) {
      where = {handle: {in: handles}}
    }

    const people = await this.prisma.person.findMany({
      where,
      select: {
        handle: true,
        grampsId: true,
        firstName: true,
        surname: true,
        birthDate: true,
        deathDate: true,
        gender: true,
      },
    })

    const analysis = {
      people: people.length,
      with_lifespan: 0,
      average_lifespan: 0,
      median_lifespan: 0,
      max_lifespan: 0,
      min_lifespan: 0,
      by_gender: {
        male: {count: 0, avg_lifespan: 0},
        female: {count: 0, avg_lifespan: 0},
        unknown: {count: 0, avg_lifespan: 0},
      },
      by_century: {} as Record<number, {count: number; avg_lifespan: number}>,
      lifespans: [] as number[],
    }

    const lifespans: number[] = []
    const genderLifespans = {
      male: [] as number[],
      female: [] as number[],
      unknown: [] as number[],
    }

    for (const person of people) {
      if (person.birthDate && person.deathDate) {
        const lifespan = this.calculateAge(
          person.birthDate,
          person.deathDate,
        )
        if (lifespan && lifespan > 0 && lifespan < 120) {
          lifespans.push(lifespan)
          analysis.with_lifespan++

          // Track by gender
          const genderKey =
            person.gender === 1 ? 'male' : person.gender === 0 ? 'female' : 'unknown'
          genderLifespans[genderKey].push(lifespan)
          analysis.by_gender[genderKey].count++

          // Track by century
          const birthYear = this.extractYear(person.birthDate)
          if (birthYear) {
            const century = Math.floor(birthYear / 100) * 100
            if (!analysis.by_century[century]) {
              analysis.by_century[century] = {count: 0, avg_lifespan: 0}
            }
            analysis.by_century[century].count++
          }
        }
      }
    }

    // Calculate statistics
    if (lifespans.length > 0) {
      analysis.average_lifespan =
        Math.round(
          (lifespans.reduce((a, b) => a + b, 0) / lifespans.length) * 10,
        ) / 10
      analysis.lifespans = lifespans
      lifespans.sort((a, b) => a - b)
      analysis.median_lifespan = lifespans[Math.floor(lifespans.length / 2)]
      analysis.max_lifespan = Math.max(...lifespans)
      analysis.min_lifespan = Math.min(...lifespans)

      // Calculate gender averages
      for (const [gender, spans] of Object.entries(genderLifespans)) {
        if (spans.length > 0) {
          analysis.by_gender[gender as keyof typeof analysis.by_gender].avg_lifespan =
            Math.round((spans.reduce((a, b) => a + b, 0) / spans.length) * 10) / 10
        }
      }
    }

    return {data: analysis}
  }

  /**
   * Get historical events that occurred during a person's lifetime
   */
  private getHistoricalEvents(
    startYear: number,
    endYear: number,
  ): TimelineEvent[] {
    const events: TimelineEvent[] = []
    const historicalEvents = this.getHistoricalEventsData()

    for (const event of historicalEvents) {
      if (event.year >= startYear && event.year <= endYear) {
        events.push({
          gramps_id: `historical_${event.year}_${event.title.replace(/\s+/g, '_')}`,
          date: event.date,
          label: event.title,
          description: event.description,
          historical: true,
          type: 'historical',
          role: event.category,
        })
      }
    }

    return events
  }

  /**
   * Curated historical events database
   */
  private getHistoricalEventsData(): HistoricalEvent[] {
    return [
      // 19th Century
      {year: 1803, date: '1803-04-30', title: 'Louisiana Purchase', description: 'U.S. doubles in size', category: 'Political'},
      {year: 1812, date: '1812-06-18', title: 'War of 1812', description: 'War between U.S. and Britain begins', category: 'Military'},
      {year: 1848, date: '1848-01-24', title: 'Gold Rush Begins', description: 'California Gold Rush starts', category: 'Economic'},
      {year: 1861, date: '1861-04-12', title: 'Civil War Begins', description: 'American Civil War starts', category: 'Military'},
      {year: 1863, date: '1863-01-01', title: 'Emancipation Proclamation', description: 'Slaves declared free in Confederate states', category: 'Political'},
      {year: 1865, date: '1865-04-09', title: 'Civil War Ends', description: 'Confederate surrender at Appomattox', category: 'Military'},
      {year: 1869, date: '1869-05-10', title: 'Transcontinental Railroad', description: 'First transcontinental railroad completed', category: 'Technology'},
      {year: 1876, date: '1876-03-10', title: 'Telephone Invented', description: 'Alexander Graham Bell invents telephone', category: 'Technology'},
      {year: 1898, date: '1898-04-25', title: 'Spanish-American War', description: 'U.S. enters war with Spain', category: 'Military'},
      
      // 20th Century
      {year: 1903, date: '1903-12-17', title: 'First Flight', description: 'Wright Brothers first powered flight', category: 'Technology'},
      {year: 1914, date: '1914-07-28', title: 'WWI Begins', description: 'World War I starts in Europe', category: 'Military'},
      {year: 1917, date: '1917-04-06', title: 'U.S. Enters WWI', description: 'United States enters World War I', category: 'Military'},
      {year: 1918, date: '1918-11-11', title: 'WWI Ends', description: 'Armistice signed, WWI ends', category: 'Military'},
      {year: 1920, date: '1920-08-18', title: "Women's Suffrage", description: '19th Amendment gives women the vote', category: 'Political'},
      {year: 1929, date: '1929-10-29', title: 'Stock Market Crash', description: 'Great Depression begins', category: 'Economic'},
      {year: 1933, date: '1933-03-04', title: 'FDR Inaugurated', description: 'Franklin D. Roosevelt becomes president', category: 'Political'},
      {year: 1939, date: '1939-09-01', title: 'WWII Begins', description: 'World War II starts in Europe', category: 'Military'},
      {year: 1941, date: '1941-12-07', title: 'Pearl Harbor', description: 'Attack on Pearl Harbor, U.S. enters WWII', category: 'Military'},
      {year: 1945, date: '1945-05-08', title: 'VE Day', description: 'Victory in Europe, WWII ends in Europe', category: 'Military'},
      {year: 1945, date: '1945-08-15', title: 'VJ Day', description: 'Victory over Japan, WWII ends', category: 'Military'},
      {year: 1950, date: '1950-06-25', title: 'Korean War Begins', description: 'Korean War starts', category: 'Military'},
      {year: 1953, date: '1953-07-27', title: 'Korean War Ends', description: 'Armistice signed, Korean War ends', category: 'Military'},
      {year: 1957, date: '1957-10-04', title: 'Sputnik Launched', description: 'Soviet Union launches first satellite', category: 'Technology'},
      {year: 1963, date: '1963-11-22', title: 'JFK Assassination', description: 'President Kennedy assassinated', category: 'Political'},
      {year: 1964, date: '1964-08-07', title: 'Vietnam War Escalates', description: 'Gulf of Tonkin Resolution passed', category: 'Military'},
      {year: 1969, date: '1969-07-20', title: 'Moon Landing', description: 'Apollo 11 lands on the moon', category: 'Technology'},
      {year: 1973, date: '1973-01-27', title: 'Vietnam War Ends', description: 'Paris Peace Accords signed', category: 'Military'},
      {year: 1989, date: '1989-11-09', title: 'Berlin Wall Falls', description: 'Berlin Wall falls, Cold War ending', category: 'Political'},
      {year: 1991, date: '1991-12-26', title: 'Soviet Union Dissolves', description: 'USSR officially dissolved', category: 'Political'},
      
      // 21st Century
      {year: 2001, date: '2001-09-11', title: 'September 11 Attacks', description: 'Terrorist attacks in U.S.', category: 'Political'},
      {year: 2008, date: '2008-09-15', title: 'Financial Crisis', description: 'Global financial crisis begins', category: 'Economic'},
      {year: 2020, date: '2020-03-11', title: 'COVID-19 Pandemic', description: 'WHO declares COVID-19 pandemic', category: 'Health'},
    ]
  }

  /**
   * Format date string for display
   */
  private formatDate(dateStr: string, _locale: string): string {
    if (!dateStr) return ''
    
    // Handle various date formats
    // If it's already in a readable format, return it
    if (dateStr.match(/^\d{4}$/)) {
      return dateStr // Just a year
    }
    
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-')
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
    }
    
    return dateStr
  }

  /**
   * Calculate age between two dates
   */
  private calculateAge(birthDate?: string | null, endDate?: string | null): number | null {
    if (!birthDate || !endDate) return null

    const birthYear = this.extractYear(birthDate)
    const endYear = this.extractYear(endDate)

    if (!birthYear || !endYear) return null

    return endYear - birthYear
  }

  /**
   * Extract year from date string
   */
  private extractYear(dateStr?: string | null): number | null {
    if (!dateStr) return null

    // Handle year only
    if (dateStr.match(/^\d{4}$/)) {
      return parseInt(dateStr)
    }

    // Handle ISO date format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return parseInt(dateStr.split('-')[0])
    }

    return null
  }

  /**
   * Parse date string for sorting
   */
  private parseDateForSort(dateStr: string): number {
    // Try to extract year from various formats
    const yearMatch = dateStr.match(/\d{4}/)
    if (yearMatch) {
      return parseInt(yearMatch[0]) * 10000
    }
    return 0
  }
}
