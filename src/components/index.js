const reqComp = require.context('./', true, /\/Gl[A-Za-z]+\.vue$/);

const components = reqComp.keys().reduce((total, current) => {
  const name = current
    .split('/')
    .at(-1)
    .slice(0, -4);

  total.push({
    name,
    component: reqComp(current).default
  });

  return total;
}, []);

export default {
  /**
   * @param {import('vue').App} app 
   */
  install(app) {
    components.forEach(item => {
      app.component(item.name, item.component);
    });
  }
};
