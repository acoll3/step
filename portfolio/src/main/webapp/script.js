 
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

// let numComments = document.getElementById('count-options').value;
// document.getElementById('count-options').addEventListener('change', updateNumComments);
// console.log(numComments);

// /** 
//  * Creates an <li> element containing text. 
//  */
// function createListElement(text) {
//   const liElement = document.createElement('li');
//   liElement.innerText = text;
//   return liElement;
// }

// /**
//  * Updates the numComments variable with the new number of comments specified by the user.
//  */
// function updateNumComments() {
//     numComments = document.getElementById('count-options').value;
// }

// /**
//  * Fetches content from the server, parses as JSON, and then adds the content to the page as a list element. 
//  */
// window.onload = async function getComments() {
//     let path = '/data?number=' + numComments;
//     console.log(path);
//     let res = await fetch(path);
//     console.log(res);
//     let comments = await res.json();
//     let parentList = document.getElementById("comments");
//     comments.forEach(comment => parentList.appendChild(createListElement(comment)));
// }

class Portfolio {
    /**
    * Creates a new Portfolio web app with a number of comments specified by the user.
    */
    constructor() {
        this.numComments = document.getElementById('count-options').value;
        document.getElementById('count-options').addEventListener('change', this.updateCommentSection);
        this.parentList = document.getElementById("comments");
    }

    /**
    * Sets up the Portfolio by getting comment data from the servlet.
    */
    async setup() {
        await this.getComments();
    }

    /**
    * Updates the comment section of the web app by updating the number of comments and getting comments data
    * from the servlet.
    */
    async updateCommentSection() {
        this.numComments = document.getElementById('count-options').value;
        console.log(this.numComments);
        console.log(this.parentList);
        for (let childComment of this.parentList.childNodes) {
            childComment.remove();
        }
        //await this.getComments();
    }

    /**
    * Updates the numComments variable with the new number of comments specified by the user.
    */
    // updateNumComments() {
    //     this.numComments = document.getElementById('count-options').value;
    // }

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
        console.log(res);
        let comments = await res.json();
        comments.forEach(comment => this.parentList.appendChild(this.createListElement(comment)));
    }
}

let portfolio = new Portfolio();
window.onload = function() {
    portfolio.setup();
}
