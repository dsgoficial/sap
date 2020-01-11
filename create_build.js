const fs = require('fs-extra')
const npmRun = require('npm-run')
const path = require('path')
const colors = require('colors')

colors.enable()

const createBuild = async () => {
  console.log('Criando build do frontend'.blue)
  console.log('Esta operação pode demorar alguns minutos')

  npmRun.exec('npm run build', { cwd: path.join(__dirname, 'client') }, async (err, stdout, stderr) => {
    if (err) {
      console.log('Erro ao criar build!'.red)
      process.exit(0)
    }
    console.log('Build criada com sucesso!')
    console.log('Copiando arquivos')
    try {
      await fs.copy(path.join(__dirname, 'client', 'build'), path.join(__dirname, 'server', 'src', 'build'))
      console.log('Arquivos copiados com sucesso!'.blue)
    } catch (error) {
      console.log(error.message.red)
      console.log('-------------------------------------------------')
      console.log(error)
    }
  })
}

createBuild()
