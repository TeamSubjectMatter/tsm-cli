#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const clear = require('clear')
const CLI = require('clui')
const inquirer = require('inquirer')
const preferences = require('preferences')
const Git = require('nodegit')
const rimraf = require('rimraf')

const repoUrl = "https://github.com/TeamSubjectMatter/TSM-Dev-Environment.git"

clear()

console.log( chalk.yellow('TSM Site Generator') )

inquirer.prompt([{
  name: 'name',
  type: 'input',
  message: 'Project Name:',
  validate: function( value ) {
    if (value.length) {
      return true;
    } else {
      return 'Please enter a project name.'
    }
  },
  filter: value => {
    return value.toLowerCase().replace(/ /g, '')
  }
}, {
  name: 'type',
  type: 'list',
  message: 'Project Type:',
  choices: [{
    name: 'WordPress',
    type: 'wordpress'
  }, {
    name: 'Drupal',
    type: 'drupal'
  }]
}, {
  name: 'hosting',
  type: 'list',
  message: 'Hosting:',
  choices: [{
    name: 'Pantheon',
    type: 'pantheon'
  }, {
    name: 'WP Engine',
    type: 'wp_engine'
  }]
}]).then(answers => {
  const newDir = `./${ answers.name.toLowerCase().replace(/ /g, '_') }`

  Git.Clone(repoUrl, newDir)
  .then((repo) => {
    Git.Remote.create(repo, 'upstream', repoUrl, function(remote) {
      if (remote) {
        console.log('remote', remote)
      }

      Git.Remote.delete(repo, 'origin', function(result) {
        if (result) {
          console.log(result)
        }
      })
    })
  })
  .then(() => {
    fs.writeFile(`./${answers.name}/project.json`, JSON.stringify({
      "project_name": answers.name,
      "host_name": `${answers.name}.dev`,
      "private_ip": "192.168.42.10",
      "database_name": `${answers.name}_local`,
      "local_url": `${answers.name}.dev`,
      "dev_url": `dev-${answers.name}.pantheonsite.io`
    }), err => {
      if ( err ) throw err;

      // clear()

      console.log(`

        ${ chalk.green('Done!') }

        Be sure to run the following:
        - ${ chalk.gray(`cd ${answers.name}`) }
        - ${ chalk.gray('composer install') }
        - ${ chalk.gray('docker-compose up') }

        Please read the setup instructions in the ${ chalk.gray('readme.md') } to migrate this project to Pantheon.

        If you get stuck, checkout the documentation:
        https://github.com/TeamSubjectMatter/TSM-Dev-Environment.git

      `)

    })

  })

})
