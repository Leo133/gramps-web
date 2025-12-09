/* eslint-disable camelcase */
/**
 * GEDCOM 5.5.1 and 7.0 Generator
 * Converts Gramps Web data structure to GEDCOM format
 */

/**
 * Generate GEDCOM content from Gramps Web data
 * @param {Object} data - Gramps Web data structure
 * @param {string} version - GEDCOM version ('5.5.1' or '7.0')
 * @returns {string} GEDCOM file content
 */
export function generateGedcom(data, version = '5.5.1') {
  const lines = []
  const handleToXref = new Map()

  // Generate cross-reference IDs
  data.people?.forEach((person, index) => {
    handleToXref.set(person.handle, `@I${String(index + 1).padStart(4, '0')}@`)
  })
  data.families?.forEach((family, index) => {
    handleToXref.set(family.handle, `@F${String(index + 1).padStart(4, '0')}@`)
  })
  data.sources?.forEach((source, index) => {
    handleToXref.set(source.handle, `@S${String(index + 1).padStart(4, '0')}@`)
  })
  data.repositories?.forEach((repo, index) => {
    handleToXref.set(repo.handle, `@R${String(index + 1).padStart(4, '0')}@`)
  })
  data.notes?.forEach((note, index) => {
    handleToXref.set(note.handle, `@N${String(index + 1).padStart(4, '0')}@`)
  })
  data.media?.forEach((media, index) => {
    handleToXref.set(media.handle, `@O${String(index + 1).padStart(4, '0')}@`)
  })

  // Header
  lines.push('0 HEAD')
  if (version === '7.0') {
    lines.push('1 GEDC')
    lines.push('2 VERS 7.0')
  } else {
    lines.push('1 SOUR Gramps Web')
    lines.push('2 VERS 1.0.0')
    lines.push('1 GEDC')
    lines.push('2 VERS 5.5.1')
    lines.push('2 FORM LINEAGE-LINKED')
  }
  lines.push('1 CHAR UTF-8')
  lines.push(
    `1 DATE ${new Date().toISOString().split('T')[0].replace(/-/g, ' ')}`
  )

  // Individuals
  data.people?.forEach(person => {
    const xref = handleToXref.get(person.handle)
    lines.push(`0 ${xref} INDI`)

    // Name
    if (person.primary_name) {
      const {first_name, surname_list, suffix} = person.primary_name
      const surname = surname_list?.[0]?.surname || ''
      const nameStr = `${first_name} /${surname}/${suffix ? ` ${suffix}` : ''}`
      lines.push(`1 NAME ${nameStr.trim()}`)
      if (first_name) {
        lines.push(`2 GIVN ${first_name}`)
      }
      if (surname) {
        lines.push(`2 SURN ${surname}`)
      }
    }

    // Sex
    const sexMap = {0: 'F', 1: 'M', 2: 'U'}
    lines.push(`1 SEX ${sexMap[person.gender] || 'U'}`)

    // Birth
    if (person.profile?.birth?.date || person.profile?.birth?.place_name) {
      lines.push('1 BIRT')
      if (person.profile.birth.date) {
        lines.push(`2 DATE ${person.profile.birth.date}`)
      }
      if (person.profile.birth.place_name) {
        lines.push(`2 PLAC ${person.profile.birth.place_name}`)
      }
    }

    // Death
    if (person.profile?.death?.date || person.profile?.death?.place_name) {
      lines.push('1 DEAT')
      if (person.profile.death.date) {
        lines.push(`2 DATE ${person.profile.death.date}`)
      }
      if (person.profile.death.place_name) {
        lines.push(`2 PLAC ${person.profile.death.place_name}`)
      }
    }

    // Family links
    person.family_list?.forEach(famHandle => {
      const famXref = handleToXref.get(famHandle)
      if (famXref) {
        const family = data.families?.find(f => f.handle === famHandle)
        if (family) {
          // Determine if this person is a spouse or child
          if (
            family.father_handle === person.handle ||
            family.mother_handle === person.handle
          ) {
            lines.push(`1 FAMS ${famXref}`)
          } else {
            lines.push(`1 FAMC ${famXref}`)
          }
        }
      }
    })

    // Gramps ID as custom tag
    if (person.gramps_id) {
      lines.push(`1 _UID ${person.gramps_id}`)
    }
  })

  // Families
  data.families?.forEach(family => {
    const xref = handleToXref.get(family.handle)
    lines.push(`0 ${xref} FAM`)

    // Husband
    if (family.father_handle) {
      const husbXref = handleToXref.get(family.father_handle)
      if (husbXref) {
        lines.push(`1 HUSB ${husbXref}`)
      }
    }

    // Wife
    if (family.mother_handle) {
      const wifeXref = handleToXref.get(family.mother_handle)
      if (wifeXref) {
        lines.push(`1 WIFE ${wifeXref}`)
      }
    }

    // Children
    family.child_ref_list?.forEach(childRef => {
      const childHandle = childRef.ref || childRef
      const childXref = handleToXref.get(childHandle)
      if (childXref) {
        lines.push(`1 CHIL ${childXref}`)
      }
    })

    // Gramps ID
    if (family.gramps_id) {
      lines.push(`1 _UID ${family.gramps_id}`)
    }
  })

  // Sources
  data.sources?.forEach(source => {
    const xref = handleToXref.get(source.handle)
    lines.push(`0 ${xref} SOUR`)
    if (source.title) {
      lines.push(`1 TITL ${source.title}`)
    }
    if (source.author) {
      lines.push(`1 AUTH ${source.author}`)
    }
    if (source.gramps_id) {
      lines.push(`1 _UID ${source.gramps_id}`)
    }
  })

  // Repositories
  data.repositories?.forEach(repo => {
    const xref = handleToXref.get(repo.handle)
    lines.push(`0 ${xref} REPO`)
    if (repo.name) {
      lines.push(`1 NAME ${repo.name}`)
    }
    if (repo.gramps_id) {
      lines.push(`1 _UID ${repo.gramps_id}`)
    }
  })

  // Notes
  data.notes?.forEach(note => {
    const xref = handleToXref.get(note.handle)
    lines.push(`0 ${xref} NOTE`)
    if (note.text?.string) {
      const noteLines = note.text.string.split('\n')
      noteLines.forEach((line, idx) => {
        if (idx === 0) {
          // First line is inline with NOTE tag, no need to add CONT
          if (line) {
            lines[lines.length - 1] = `0 ${xref} NOTE ${line}`
          }
        } else {
          lines.push(`1 CONT ${line}`)
        }
      })
    }
    if (note.gramps_id) {
      lines.push(`1 _UID ${note.gramps_id}`)
    }
  })

  // Media
  data.media?.forEach(media => {
    const xref = handleToXref.get(media.handle)
    lines.push(`0 ${xref} OBJE`)
    if (media.path) {
      lines.push(`1 FILE ${media.path}`)
    }
    if (media.desc) {
      lines.push(`1 TITL ${media.desc}`)
    }
    if (media.gramps_id) {
      lines.push(`1 _UID ${media.gramps_id}`)
    }
  })

  // Trailer
  lines.push('0 TRLR')

  return `${lines.join('\n')}\n`
}

/**
 * Generate GEDCOM 7.0 with ZIP support
 * @param {Object} data - Gramps Web data structure
 * @param {Array} mediaFiles - Array of media file buffers
 * @returns {Object} Object with gedcom content and media files
 */
export function generateGedcom70WithMedia(data, mediaFiles = []) {
  const gedcomContent = generateGedcom(data, '7.0')

  return {
    gedcom: gedcomContent,
    media: mediaFiles,
    // For now, return as object. In real implementation, this would create a ZIP
  }
}
