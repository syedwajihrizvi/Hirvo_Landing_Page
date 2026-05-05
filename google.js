const CLIENT_ID = "728245733416-fo63nvf0mh2dn2n6dsi6tt6ige4hgojl.apps.googleusercontent.com";
const API_KEY = "AIzaSyBzHc0iKKgxZleOC8fbzCaepS6FCIS5GcA";
const APP_ID = "728245733416";

let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;

let urlParams = new URLSearchParams(window.location.search);
const maxFileSize = urlParams.get('maxFileSize');

document.getElementById('pick-button').style.visibility = 'hidden';

function gapiLoaded() {
    gapi.load('client:picker', initializePicker)
}

async function initializePicker() {
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    pickerInited = true;
    maybeEnablePicker();
}

function gisLoaded() { 
    log("Initializing Google Identity Services...");
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: '',
        error_callback: (error) => {
            log("Error obtaining access token: " + JSON.stringify(error));
        }
    });
    gisInited = true; 
    maybeEnablePicker();
    log("Google Identity Services loaded");
}

function maybeEnablePicker() {
    if (pickerInited && gisInited) {
        document.getElementById('pick-button').style.visibility = 'visible';
        log("Picker is ready. User can now select a file.");
    }
}

function isValidFileType(fileType, mimeType) {
    const validTypes = ["application/pdf", "application/vnd.google-apps.document"
    ];
    return validTypes.includes(fileType) || validTypes.includes(mimeType);
}

function resetFileSelection() {
    document.querySelector(".google-picker-file-success").style.display = "none";
    document.querySelector(".google-picker-file-success .bi-file-earmark-pdf-fill").style.display = "none"
    document.querySelector(".google-picker-file-success .bi-file-earmark-text-fill").style.display = "none"
    var fileDataP = document.querySelectorAll(".google-picker-file-success .file-info-grid p.value");
    fileDataP[0].textContent = "";
    fileDataP[1].textContent = "";
    fileDataP[2].textContent = "";
    document.querySelector(".google-picker-file-container").style.display = "block";
    log("File selection reset. Ready for new selection.");
}

function handleAuthClick() {
    log("handleAuthClick called. Initiating authentication flow...");
    tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
            throw (response)
        }
        accessToken = response.access_token;
        log("Access token obtained successfully.");
        createPicker();
    }

    if (accessToken === null) {
        log("Requesting access token with prompt: consent");
        tokenClient.requestAccessToken({ prompt: 'consent' });
        log("Access token request initiated");
    } else {
        log("Access token already available, refreshing token...");
        tokenClient.requestAccessToken({ prompt: '' });
        log("Access token refresh initiated");
    }
}

const log = (msg) => {
    // try {
    //     const el = document.getElementById('debug-log');
    //     const content = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    //     el.innerHTML += `> ${content}<br>`;
    //     el.scrollTop = el.scrollHeight;
    // } catch (error) {
    //     console.error("Logging error: ", error);
    // }
};

function createPicker() {
    const docsView = new google.picker.DocsView(google.picker.ViewId.DOCS)
    docsView.setMode(google.picker.DocsViewMode.LIST);
    const picker = new google.picker.PickerBuilder()
        .addView(docsView)
        .setTitle("Select a file from Google Drive")
        .setOAuthToken(accessToken)
        .setDeveloperKey(API_KEY)
        .setCallback(pickerCallback)
        .setAppId(APP_ID)
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setSize(window.innerWidth * 0.8, window.innerHeight)
        .build();
    picker.setVisible(true);
}

function pickerCallback(data) {
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        const doc = data[google.picker.Response.DOCUMENTS][0];
        const payLoad = {
            id: doc[google.picker.Document.ID],
            name: doc[google.picker.Document.NAME],
            fileType: doc[google.picker.Document.TYPE],
            mimeType: doc[google.picker.Document.MIME_TYPE],
            fileSize: doc["sizeBytes"] || null,
        };
        if (maxFileSize && payLoad.fileSize && payLoad.fileSize > parseInt(maxFileSize)) {
            log(`Selected file size (${payLoad.fileSize} bytes) exceeds the maximum allowed (${maxFileSize} bytes).`);
            alert(`The selected file is too large. Please select a file smaller than ${maxFileSize} bytes.`);
            return;
        }
        if (!isValidFileType(payLoad.fileType, payLoad.mimeType)) {
            log(`Invalid file type selected: ${payLoad.fileType} (${payLoad.mimeType}).`);
            alert("Invalid file type. Please select a PDF or Google Docs file.");
            return;
        }
        document.querySelector(".google-picker-file-success").style.display = "block";
        const isPdf = payLoad.mimeType === "application/pdf";
        if (isPdf) {
            document.querySelector(".google-picker-file-success .bi-file-earmark-pdf-fill").style.display = "block"
            document.querySelector(".google-picker-file-success .bi-file-earmark-text-fill").style.display = "none"
        } else {
            document.querySelector(".google-picker-file-success .bi-file-earmark-pdf-fill").style.display = "none"
            document.querySelector(".google-picker-file-success .bi-file-earmark-text-fill").style.display = "block"
        }
        var fileDataP = document.querySelectorAll(".google-picker-file-success .file-info-grid p.value");
        fileDataP[0].textContent = payLoad.name;
        fileDataP[1].textContent = payLoad.mimeType;
        fileDataP[2].textContent = payLoad.fileSize;
        const redirectUrl = `com.syedwajihrizvi.hirvo://oauthredirect?fileData=${encodeURIComponent(JSON.stringify(payLoad))}`;
        log("Sending to React Native Frontend using deep linking..." + redirectUrl);
        window.location.href = redirectUrl;
    }
}
