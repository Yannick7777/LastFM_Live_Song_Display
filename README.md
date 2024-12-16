# Last FM Live Song display
Full screen Song display of the currently playing song with the use of the last.fm API.
Designed for use in Bars, Restaurants or similar.

### Demo
[Demo here](https://eyer.life/music_demo)

## Features
- Live display of currently playing song
- Live display of album-thumbnail via the Spotify API
- Disable all traces of the username in requests / URLs for privacy

## Installation
### Preparation
- Fill out the [last.fm API Account creation form](https://www.last.fm/api/account/create).
- After filling the form out, it'll display an API key and a shared secret.
- In this case, you only need the API key. Copy it to a safe location for later usage.
- Fill out the [Spotify app creation form](https://developer.spotify.com/dashboard/create).
- **Important**: Do not forget to tick the "Web API" box at the end of the page.
- Click the "settings" button at the top right of the screen.
- Copy your client to a safe location for later usage.
- Click "View client secret" and copy it to a safe location as well.

### After you got your API keys
- Navigate to your website root and into a directory inside the webroot of a PHP enabled webserver like Apache.
- Install composer by following the [instructions on their official website.](https://getcomposer.org/download/)
- Clone this repo: `git clone https://github.com/Yannick7777/lastfm_html_integration.git`
- Rename the directory to the name you want: `mv lastfm_html_integration/ your_chosen_name/`
- Change the directory to the root of the project: `cd your_chosen_name/`
- Copy the .env_example and save it as .env: `cp .env_example .env`
- Edit the .env file with your favourite text editor, for example nano: `nano .env`
- Paste all of your API Keys and secrets into the right spots and save.
- Set `LAST_FM_USER_API_RESTRICTION` to true if... 
  - ...you're ok with your visitors being able to see your last.fm username.
  - ...you're ok with your visitors being able to use your API with their own username for their own project. (Only if CORS isn't correctly set)
  - ...you want to use your API with multiple different last.fm users. In this case set the username
in the javascript of the individual site: `const USERNAME_TO_OVERWRITE_API_WITH = "";`
- Else it doesn't really matter what you set it to.
- Navigate to your browser in the website; it should all work now!
