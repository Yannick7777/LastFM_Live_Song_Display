const USERNAME_TO_OVERWRITE_API_WITH = "";
// Set this variable to the username you want to display the songs of if you're using this API for multiple last.fm users.
// If you only want to show one user's currently playing song on your website use .env to set the username instead.
// Make sure that LAST_FM_USER_API_RESTRICTION is false if you're using it.
const api = `api.php`
const urlUser = `${api}?type=getUser`;
const urlCurrentlyPlayingBase = `${api}?type=lastfm`;
const urlSpotifytrackInfoBase = `${api}?type=spotify&query=`;
let playing = null;
let currentlyListening = null;
let isFetching = false;

// fetch('https://eyer.life/me/api.php?type=getUser')
//     .then(response => response.json())
//     .then(json => console.log(json));


// const dataUser = responseUser.json();
// const user = dataUser.user;
// console.log(dataUser);
async function getUrlCurrentlyPlaying () {
    const responseUserInfo = await fetch(urlUser);
    const dataUserInfo = await responseUserInfo.json();
    if (dataUserInfo.restrictedAPI === "true") {
        if (USERNAME_TO_OVERWRITE_API_WITH !== "") {
            console.log("Check your .env and set LAST_FM_USER_API_RESTRICTION to false to use multiple users with" +
                " the API. \nGetting currently playing songs of the user set in .env as the API is ignoring the user" +
                " set in the Javascript.")

        }
        return urlCurrentlyPlayingBase
    } else {
        console.log(`${urlCurrentlyPlayingBase}&user=${dataUserInfo.user}`);
        return `${urlCurrentlyPlayingBase}&user=${dataUserInfo.user}`;
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkNowPlaying() {
    if (isFetching) { return; }
    isFetching = true;
    try {
        const responseCurrentlyPlaying = await fetch(await urlCurrentlyPlaying); // here is an await before
        // "urlcurrentlyplaying" required, as the variables is getting set by an async function.
        // I can't use await when defining the value, as I'm not defining it inside an async function.
        if (responseCurrentlyPlaying.status === 500) {
            console.log("Last FM API Failure, aborting response...");
            isFetching = false;
            return;
        }
        const dataCurrentlyPlaying = await responseCurrentlyPlaying.json();
        isFetching = false;
        const track = dataCurrentlyPlaying.recenttracks.track[0];
        const titel = track.name;
        const artist = track.artist['#text'];
        if (track['@attr'] && track['@attr'].nowplaying.toLowerCase() === "true") {
            playing = true;
            if (currentlyListening === titel + artist) { return; }
            //const urlTrackInfo = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${artist.replace(/\s+/g, "+")}&track=${titel.replace(/\s+/g, "+")}&format=json`;
            //const responseTrackInfo = await fetch(urlTrackInfo);
            //const dataTrackInfo = await responseTrackInfo.json();
            const urlSpotifyTrackInfo = `${urlSpotifytrackInfoBase}${encodeURIComponent(titel.replace("&", "and") + " - " + artist.replace("&", "and"))}`;
            const responseSpotifyTrackInfo = await fetch(urlSpotifyTrackInfo);
            const dataSpotifyTrackInfo = await responseSpotifyTrackInfo.json();
            document.getElementById("lastfmsong").innerHTML = `I'm currently listening to: <br> <strong> ${titel} - ${artist} </strong>`;
            // albumPicLink = track.image[track.image.length - 2]['#text'];
            albumPicLink = dataSpotifyTrackInfo.tracks.items[0].album.images[0].url;
            document.getElementById("lastfmthumbnail").innerHTML = `<img id="lastfmthumbnailimg" src="${albumPicLink}"><br><p class="tiny">Thumbnail might not be accurate as there are many songs which are available on YTM but not on Spotify.</p> `;
            currentlyListening = titel + artist;
        } else {
            if (playing === false) { return; } // Return if a timer's already running
            playing = false;
            await sleep(3000); // Check if it's still not playing after 3 sec
            if (playing) {
                return;
            }
            document.getElementById("lastfmsong").innerHTML = "<p>I'm currently listening to: <br> nothing :(<p><br>";
            document.getElementById("lastfmthumbnail").innerHTML = "";
            currentlyListening = null;
            return;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        currentlyListening = null;
        return;
    }
}



const urlCurrentlyPlaying = getUrlCurrentlyPlaying();
setInterval(() => checkNowPlaying(), 1000); // Check all 1000ms = 1 sec
checkNowPlaying(); // first check