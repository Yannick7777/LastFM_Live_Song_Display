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
let currentGradients = [[0, 0, 0], [0, 0, 0]];

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
            document.getElementById("lastfmsong").innerHTML = `<p>I'm currently listening to: </p><p> <strong> ${titel} - ${artist} </strong><p>`;
            // albumPicLink = track.image[track.image.length - 2]['#text']; // Alternative album picture fetching over the last. fm api
            const albumPicLink = dataSpotifyTrackInfo.tracks.items[0].album.images[0].url;
            const img = new Image();
            var existingimg = document.getElementById("lastfmthumbnail").querySelector("#lastfmthumbnailimg");
            if(existingimg) {existingimg.style.zIndex = 2};
            img.src = albumPicLink;
            img.id = "lastfmthumbnailimgnew";
            img.style.zIndex = 4;
            img.crossOrigin = "Anonymous";
            await img
                .decode()
                .then(() => {
                    if(existingimg) {
                        existingimg.style.animation="fadeout 1s ease-in";
                        existingimg.style.opacity = 0;
                        setTimeout(() => {
                            document.getElementById("lastfmthumbnail").removeChild(existingimg)
                          }, 2000);
                        ; // to be commented out
                    } else {
                        // img.style.opacity = 100;
                    }
                    document.getElementById("lastfmthumbnail").appendChild(img);

                })
                .catch(encodingError => console.error(encodingError));
            
            currentlyListening = titel + artist;
            const colorThief = new ColorThief();

             let albumPicColors;
             if (img.complete) {
                 albumPicColors = await colorThief.getPalette(img, 2, 1);
                 console.log("image loaded completely")
             } else {
                 img.addEventListener('load', function() {
                     albumPicColors = colorThief.getPalette(img, 2, 1);
                     console.log("waited for image to load completely")
                 });
             }
             const albumPicTop1 = `${albumPicColors[0][0]}, ${albumPicColors[0][1]}, ${albumPicColors[0][2]}`;
             console.log(albumPicColors);
             const albumPicAverageColor =
                [Math.round((albumPicColors[0][0] + albumPicColors[1][0]) / 2),
                Math.round((albumPicColors[0][1] + albumPicColors[1][1]) / 2),
                Math.round((albumPicColors[0][2] + albumPicColors[1][2]) / 2)];
            console.log(albumPicAverageColor);
 
            img.style.zIndex = 4;
            img.style.animation = "fade 2s ease-in";
            img.style.opacity = 100;
            currentGradients = [albumPicAverageColor, albumPicTop1];


             // document.body.style.background = `linear-gradient(-45deg, rgb(${albumPicAverageColor}), rgb(${albumPicColors[0][0]}, ${albumPicColors[0][1]}, ${albumPicColors[0][2]}))`;
            document.body.style.background = `linear-gradient(-45deg, rgb(${albumPicAverageColor}), rgb(${albumPicTop1})`;
            console.log("avarage colour: " + albumPicAverageColor)
            console.log( "top colour: " + albumPicTop1)
            img.id="lastfmthumbnailimg"
        } else {
            if (playing === false) { return; } // Return if a timer's already running
            playing = false;
            await sleep(3000); // Check if it's still not playing after 3 sec
            if (playing) {
                return;
            }
            document.getElementById("lastfmsong").innerHTML = "<p>I'm currently listening to:</p><p>nothing :(<p><br>";
            const img = document.getElementById("lastfmthumbnail").querySelector("#lastfmthumbnailimg")
            document.getElementById("lastfmthumbnail").removeChild(img);
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
setInterval(() => checkNowPlaying(), 2000); // Check all 1000ms = 1 sec
checkNowPlaying(); // first check