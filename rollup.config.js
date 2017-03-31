// Rollup plugins
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  format: 'cjs',
  sourceMap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
