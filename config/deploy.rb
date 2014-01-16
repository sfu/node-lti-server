set :stages,        %w(production production_1 production_2 staging)
set :default_stage, "staging"
require "capistrano/ext/multistage"

def current_git_branch
  branch = `git symbolic-ref HEAD 2> /dev/null`.strip.gsub(/^refs\/heads\//, '')
  puts "Deploying branch #{branch}"
  branch
end

set :application,   "node-lti-server"
set :repository,    "git://github.com/sfu/node-lti-server.git"
set :scm,           :git
set :branch,        "master"
set :user,          "nodeuser"
set :deploy_via,    :remote_cache
set :deploy_to,     "/var/nodeapps/node-lti-server"
set :use_sudo,      false
set :node_env,      "production"
default_run_options[:pty] = true
ssh_options[:forward_agent] = true
ssh_options[:keys] = [File.join(ENV["HOME"], ".ssh", "id_rsa_nodeuser")]

if (ENV.has_key?('gateway') && ENV['gateway'].downcase == "true")
  set :gateway, "welcome.its.sfu.ca"
end

if (ENV.has_key?('branch'))
   set :branch, ENV['branch']
end

# this tells capistrano what to do when you deploy
namespace :deploy do

  desc <<-DESC
  A macro-task that updates the code and fixes the symlink.
  DESC
  task :default do
    transaction do
      update_code
      node.npminstall
      symlink
    end
  end

    task :update_code, :except => { :no_release => true } do
        on_rollback { run "rm -rf #{release_path}; true" }
        strategy.deploy!
    end

    task :restart do
      run "nohup /sbin/service ltiserver restart"
    end

end

namespace :node do

    desc "Create log an pids directory in shared_path"
    task :create_shared_dirs do
      run "mkdir -p #{shared_path}/{log,pids}"
    end

    desc "Create node_modules symlink"
    task :node_modules_symlink do
        run "cd #{latest_release} && ln -s #{shared_path}/node_modules node_modules"
    end

    desc "Install node modules with npm"
    task :npminstall do
        run "cd #{latest_release} && npm install"
    end
end

after("deploy:setup", "node:create_shared_dirs")
after(:deploy, "deploy:restart")
after "deploy:restart", "deploy:cleanup"
