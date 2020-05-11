const path = require('path')
const fs = require('fs-extra')

module.exports = async () => {
  const dataDir = path.join(__dirname, '..', 'data')
  const res = await fs.pathExists(dataDir)

  if (!res) {
    await fs.mkdir(dataDir)
    console.log('Create data folder')
  }
}