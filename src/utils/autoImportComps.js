const modules = import.meta.glob('../autoComponents/**/*.vue', { eager: true })
export default {
  async install(app) {
    for (const path in modules) {
      const module = await modules[path]
      const fileReg = /\/(\w*)\.vue/
      let matchFileArr = path.match(fileReg)
      if (matchFileArr) {
        let componentName = matchFileArr[1]
        let finalComponents = module.default || module
        app.component(componentName, finalComponents)
      }
    }
  },
}
