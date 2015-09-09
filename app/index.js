'use strict';

var yo = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var extend = require('extend');

module.exports = yo.generators.Base.extend({
    params: {
        shouldDoEverything: false,
        vagrantfilePath: "./Vagrantfile",
        shouldCreateProvisionScript: true,
        provisionScriptPath: "./vagrant-provision.sh",
        vagrantBox: "ubuntu/trusty64",
        aptPackages: "apache2 mysql-client mysql-server php5 php5-mysql php5-cli php5-curl php5-gd libssh2-php npm nodejs-legacy nodejs git sendmail silversearcher-ag php5-xdebug",
        timezone: "Etc/UTC",
        shouldSetupMysql: true,
        mysqlRootPassword: "root",
        shouldCreateMysqlDatabase: true,
        importMysqlDataPath: "",
        mysqlName: "dev",
        mysqlUser: "dev",
        mysqlPass: "dev",
        webRoot: "/vagrant",
        shouldRunApacheAsVagrant: true,
        shouldGenerateSshKeys: true,
        shouldInstallComposer: true,
        npmGlobalPackages: "gulp bower",
        shouldInstallWpCli: true
    },

    prompting: function() {
        // yosay something
        console.log(yosay(chalk.cyan("VAGRANT!\n") + chalk.green("Let's create a shell provisioned Vagrant setup.")));

        var done = this.async();
        var self = this;

        this.prompt({
                type: "confirm",
                name: "shouldDoEverything",
                message: "No more questions, just do everything?",
                default: self.params.shouldDoEverything
            }, function(answers) {
                // already got all the answers we need
                if(answers.shouldDoEverything) {
                    self.params.shouldDoEverything = true;
                    done();
                    return;
                }

                var initialQuestions = [
                    {
                        type: "input",
                        name: "vagrantfilePath",
                        message: "Where should we put the Vagrantfile?",
                        default: self.params.vagrantfilePath,
                    },
                    {
                        type: "input",
                        name: "vagrantBox",
                        message: "What box do you want to use?",
                        default: self.params.vagrantBox,
                    },
                    {
                        type: "confirm",
                        name: "shouldCreateProvisionScript",
                        message: "Create a provision script?",
                        default: self.params.shouldCreateProvisionScript
                    }
                ];

                self.prompt(initialQuestions, function(initialAnswers) {
                    // if we don't want to create a provision script,
                    // we're done asking questions
                    if( !initialAnswers.shouldCreateProvisionScript ) {
                        extend(self.params, initialAnswers);
                        done();
                        return;
                    }

                    var scriptQuestions = [
                        {
                            type: "input",
                            name: "provisionScriptPath",
                            message: "Where should the provision script go?",
                            default: self.params.provisionScriptPath
                        },
                        {
                            type: "input",
                            name: "timezone",
                            message: "Timezone",
                            default: self.params.timezone
                        },
                        {
                            type: "input",
                            name: "aptPackages",
                            message: "Install these APT packages",
                            default: self.params.aptPackages
                        },
                        {
                            type: "confirm",
                            name: "shouldSetupMysql",
                            message: "Want to use MySQL?",
                            default: self.params.shouldSetupMysql
                        },
                        {
                            type: "input",
                            name: "mysqlRootPassword",
                            message: "MySQL root password",
                            default: self.params.mysqlRootPassword,
                            when: function(answers) {
                                return answers.shouldSetupMysql;
                            }
                        },
                        {
                            type: "confirm",
                            name: "shouldCreateMysqlDatabase",
                            message: "Want to create an empty MySQL database?",
                            default: self.params.shouldCreateMysqlDatabase,
                            when: function(answers) {
                                return answers.shouldSetupMysql;
                            }
                        },
                        {
                            type: "input",
                            name: "mysqlName",
                            message: "MySql database name",
                            default: self.params.mysqlName,
                            when: function(answers) {
                                return answers.shouldCreateMysqlDatabase;
                            }
                        },
                        {
                            type: "input",
                            name: "mysqlUser",
                            message: "MySql database username",
                            default: self.params.mysqlUser,
                            when: function(answers) {
                                return answers.shouldCreateMysqlDatabase;
                            }
                        },
                        {
                            type: "input",
                            name: "mysqlPass",
                            message: "MySql database password",
                            default: self.params.mysqlPass,
                            when: function(answers) {
                                return answers.shouldCreateMysqlDatabase;
                            }
                        },
                        {
                            type: "input",
                            name: "importMysqlDataPath",
                            message: "Import an .sql file into the database?",
                            default: self.params.importMysqlDataPath,
                            when: function(answers) {
                                return answers.shouldCreateMysqlDatabase;
                            }
                        },
                        {
                            type: "input",
                            name: "webRoot",
                            message: "Where do you want to point the web root?",
                            default: self.params.webRoot
                        },
                        {
                            type: "confirm",
                            name: "shouldRunApacheAsVagrant",
                            message: "Run Apache as the 'vagrant' user?",
                            default: self.params.shouldRunApacheAsVagrant
                        },
                        {
                            type: "confirm",
                            name: "shouldGenerateSshKeys",
                            message: "Generate SSH keys?",
                            default: self.params.shouldGenerateSshKeys
                        },
                        {
                            type: "confirm",
                            name: "shouldInstallComposer",
                            message: "Install Composer?",
                            default: self.params.shouldInstallComposer
                        },
                        {
                            type: "input",
                            name: "npmGlobalPackages",
                            message: "Install these NPM packages globally",
                            default: self.params.npmGlobalPackages
                        },
                        {
                            type: "confirm",
                            name: "shouldInstallWpCli",
                            message: "Install Wordpress CLI (wp-cli)?",
                            default: self.params.shouldInstallWpCli
                        }
                    ];

                    self.prompt(scriptQuestions, function(scriptAnswers) {
                        extend(self.params, initialAnswers, scriptAnswers);
                        done();
                    });
                });
            }
        );
    },

    configuring: {
        app: function () {
            var self = this;

            this.fs.copyTpl(
                this.templatePath('_Vagrantfile'),
                this.destinationPath(self.params.vagrantfilePath),
                {
                    vagrantBox: self.params.vagrantBox,
                    shouldCreateProvisionScript: self.params.shouldCreateProvisionScript,
                    provisionScriptPath: self.params.provisionScriptPath
                }
            );

            if(self.params.shouldCreateProvisionScript) {
                this.fs.copyTpl(
                    this.templatePath('_provision'),
                    this.destinationPath(self.params.provisionScriptPath),
                    {
                        params: self.params
                    }
                );
            }
        }
    }
});
