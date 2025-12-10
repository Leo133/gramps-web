import replace from '@rollup/plugin-replace'
import {fromRollup} from '@web/dev-server-rollup'

const replacePlugin = fromRollup(replace)

export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  plugins: [
    replacePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env': JSON.stringify({}),
      preventAssignment: true,
    }),
  ],
};