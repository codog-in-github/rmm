import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  presets: [presetUno()],
  rules:   [
    [/^(bg|color)-(primary|success|warning|danger|info)-([35789])$/, function(matched) {
      const [, property, type, deep] = matched;
      return {
        [property === 'bg' ? 'background-color' : 'color']: `var(--el-color-${type}-light-${deep})`
      };
    }],
    [/^(bg|color)-(primary|success|warning|danger|info)$/, function(matched) {
      const [, property, type] = matched;
      return {
        [property === 'bg' ? 'background-color' : 'color']: `var(--el-color-${type})`
      };
    }]
  ]
});
