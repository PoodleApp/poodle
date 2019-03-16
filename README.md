# poodle

Experimental email client with social features.
Poodle is in very early stages of development, so functionality is limited!


## Building and running from source

### Prerequisites

Running from source is supported on macOS and Linux.
You might have success with the Linux Subsystem on Windows.

You must have these programs installed:

- g++
- Node v8 or later
- tmux
- yarn v0.26.0 or later

On macOS you can get g++ by installing the
[Apple Command Line Tools Package][].
On Debian-based Linux systems you can get it by installing the
`build-essential` package.

[Apple Command Line Tools Package]: https://developer.apple.com/library/content/technotes/tn2339/_index.html

The easiest way to get the current version of Node is to run the
[nvm install script][nvm].
Follow the instructions printed by the installer,
and then run these commands to set the current stable Node release as your
default node:

    $ nvm install stable
    $ nvm alias default stable

[nvm]: https://github.com/creationix/nvm#install-script

If your package manager does not have a recent version of yarn available you
can get the latest version by following instructions on the
[yarn installation][yarn] page.

[yarn]: https://yarnpkg.com/lang/en/docs/install/

On Linux you also need some development libraries installed for building npm
modules with native dependencies.
On Debian-based systems the required dependencies are:

- `libgnome-keyring-dev`
- `libsecret-1-dev`


### Running

In the top level directory run the command:

    $ yarn && yarn start
