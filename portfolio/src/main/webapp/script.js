 
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
    }

    /**
    * Sets up the Portfolio by getting comment data from the servlet.
    */
    async setup() {
        await this.getComments();
        this.setupPlaceMaps();
        this.setupRestaurantMap();
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
        if (res.status == 404){
            alert("Empty datastore.");
        } else if (res.status == 500) {
            alert('Error: invalid count requested. Fewer than ' + this.numComments + ' comments exist.');
        } else 
        if (res.status != 200) {
            alert('Error generated in HTTP response from servlet');
        }

        let comments = await res.json();
        let parentList = document.getElementById("comments");
        comments.forEach(comment => parentList.appendChild(this.createListElement(comment)));
    }

    /**
    * Deletes all comments from the datastore.
    */
    async deleteComments() {
        let path = '/delete-data';
        let res = await fetch(path, { method: 'POST' });

        /* Check for errors in the HTTP response and alert the user. */
        if (res.status != 200) {
            alert('Error generated in HTTP response from servlet');
        }
    }

    /**
    * Adds four maps to the page showing four places I really want to visit.
    */
    setupPlaceMaps() {
        let mapOptions;
        for (let i = 0; i < 4; i++) {
            switch(i) {
                /* Glacier National Park */
                case 0:
                    mapOptions = {
                        zoom: 8,
                        center: {lat: 48.760815, lng: -113.786722},
                    };
                    this.createMap(mapOptions, 'glacier');
                    break;
                /* Edinburgh */
                case 1:
                    mapOptions = {
                        zoom: 8,
                        center: {lat: 55.943914, lng: -3.21689},
                    };
                    this.createMap(mapOptions, 'edinburgh');
                    break;
                /* San Blas Islands */
                case 2:
                    mapOptions = {
                        zoom: 8,
                        center: {lat: 9.5702911, lng: -78.9272882},
                    };
                    this.createMap(mapOptions, 'sanblas');
                    break;
                /* Fjordland National Park */
                case 3:
                    mapOptions = {
                        zoom: 8,
                        center: {lat: -45.4572629, lng: 167.2282707}
                    };
                    this.createMap(mapOptions, 'fjord');
                    break;
            }
        }
    }

    /**
    * Creates a single map with the given options.
    */
    setupRestaurantMap() {
        let mapOptions = {
            zoom: 8,
            center: {lat: 41.781079, lng: -88.382634}
        };
        this.createMap(mapOptions, 'restaurants');
    }

    /**
    * Creates a single map with the given options.
    */
    createMap(mapOptions, id) {
        const map = new google.maps.Map(
            document.getElementById(id),
            mapOptions);
        
        map.setTilt(45);
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
