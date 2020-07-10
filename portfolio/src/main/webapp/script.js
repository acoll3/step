 
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

class Portfolio {
    /**
    * Creates a new Portfolio web app with a number of comments specified by the user.
    */
    constructor() {
        this.numComments = document.getElementById('count-options').value;
        this.visitLocs = {  glacier: { lat: 48.760815, lng: -113.786722 }, 
                            edinburgh: { lat: 55.943914, lng: -3.21689 }, 
                            sanblas: { lat: 9.5702911, lng: -78.9272882 }, 
                            fjord: { lat: -45.4572629, lng: 167.2282707 } 
                         };
        this.parkLocs = { 'Zion': { lat: 37.3220096, lng: -113.1833194 } ,
                          'Rocky Mountain': { lat: 40.3503939, lng: -105.9566636 },
                          'Grand Teton': { lat: 43.6594418, lng: -111.000682 },
                          'Joshua Tree': { lat: 33.8987129, lng: -116.4211304},
                        };
    }

    /**
    * Sets up the Portfolio by getting comment data from the servlet.
    */
    async setup() {
        await this.getComments();
        this.setupPlaceMaps();
        this.setupParkMap();
        this.setupFooter();
    }

    /**
    * Sets up display of the footer (either a login link or comments form) based on the login status of the user.
    */
    async setupFooter() {
        let path = '/login';
        let res = await fetch(path);
        let loginStatus = await res.text();

        /* If the user is logged in, hide the login link and display the comments form. */
        if (loginStatus.trim() === 'true') {
            document.getElementById('login-footer').style.display = 'none';
            document.getElementById('comments-footer').style.display = 'flex';
        } else { // hide comments and show login if user is not logged in
            document.getElementById('login-link').href = loginStatus;
            document.getElementById('login-footer').display = 'flex';
            document.getElementById('comments-footer').display = 'none';
        }
    }

    /**
    * Removes all comments from the DOM.
    */
    removeComments() {
        this.numComments = document.getElementById('count-options').value;
        let parentList = document.getElementById("comments");
        parentList.innerHTML = '';
    }

    /** 
    * Creates an <li> element containing text. 
    */
    createListElement(text) {
        const liElement = document.createElement('li');
        liElement.innerText = text;
        return liElement;
    }

    /**
    * Fetches content from the server, parses as JSON, and then adds the content to the page as a list element. 
    */
    async getComments() {
        let path = '/data?number=' + this.numComments;
        let res = await fetch(path);

        /* Check for errors in the HTTP response and alert the user. */
        if (res.status === 404){
            alert("Empty datastore.");
        } else if (res.status === 500) {
            alert(`Error: invalid count requested.  Fewer than ${this.numComments} comments exist.`);
        } else 
        if (res.status !== 200) {
            alert('Error generated in HTTP response from servlet');
        }

        let comments = await res.json();
        let parentList = document.getElementById("comments");
        for (let [comment, email] of Object.entries(comments)) {
            parentList.appendChild(this.createListElement(`${comment} posted by ${email}`));
        }
    }

    /**
    * Deletes all comments from the datastore.
    */
    async deleteComments() {
        let path = '/delete-data';
        let res = await fetch(path, { method: 'POST' });

        /* Check for errors in the HTTP response and alert the user. */
        if (res.status !== 200) {
            alert('Error generated in HTTP response from servlet');
        }
    }

    /**
    * Adds four maps to the page showing four places I really want to visit.
    */
    setupPlaceMaps() {
        let mapOptions;

        for (let loc of Object.entries(this.visitLocs)) {
            mapOptions = {  
                            zoom: 8,
                            center: loc[1]
                        };
            this.createMap(mapOptions, loc[0]);
        }

    }

    /**
    * Creates a map with pins of my favorite national parks.
    */
    setupParkMap() {
        let usa = { lat: 44.0733586, lng: -97.5443135 };
        let mapOptions = {
            zoom: 3,
            center: usa
        };
        let map = this.createMap(mapOptions, 'parks');

        for (const [name, position] of Object.entries(this.parkLocs)) {
            let marker = new google.maps.Marker({position, map});
            let infowindow = new google.maps.InfoWindow({ content: name });
            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        }

    }

    /**
    * Creates a single map with the given options.
    */
    createMap(mapOptions, id) {
        const map = new google.maps.Map(
            document.getElementById(id),
            mapOptions);
        map.setTilt(45);
        return map;
    }
}

let portfolio = new Portfolio();
window.onload = async function() {
    await portfolio.setup();
}

document.getElementById('delete-button').addEventListener('click', async function() {
    await portfolio.deleteComments();
    portfolio.removeComments();
});

document.getElementById('count-options').addEventListener('change', async function() {
    portfolio.removeComments();
    await portfolio.getComments();
});
