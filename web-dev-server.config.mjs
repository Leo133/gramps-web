import {fromRollup} from '@web/dev-server-rollup'
import rollupReplace from '@rollup/plugin-replace'
import proxy from 'koa-proxies';
import compress from 'koa-compress';

const replace = fromRollup(rollupReplace)

export default {
  middleware: [
    compress(),
    proxy('/api', {
      target: 'http://localhost:5555',
      changeOrigin: true,
    }),
  ],
  plugins: [
    replace({
      include: [
        'node_modules/@popperjs/**/*.js',
        'node_modules/@popperjs/**/*.ts',
        'node_modules/tippy.js/**/*.ts',
        'node_modules/tippy.js/**/*.js'
      ],
      preventAssignment: true,
      'process.env.NODE_ENV': '"production"'
    })
  ]
}
