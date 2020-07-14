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

package com.google.sps.servlets;

import java.io.IOException;
import java.util.*;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.RequestDispatcher;
import com.google.gson.*;

/** Servlet that returns comment data created by the user. */
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    int numComments = 0;

    try {
        numComments = Integer.parseInt(request.getParameter("number"));
    } catch (NumberFormatException e) {
        // Leave the default value alone.
    }
    
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    /* If no comments are returned by the query, set a descriptive HTTP status code to signify an error. */
    Iterable<Entity> commentEntities = results.asIterable(FetchOptions.Builder.withLimit(numComments));
    if (!commentEntities.iterator().hasNext()) {
        response.sendError(404);
        return;
    }

    ArrayList<Map<String, Object>> commentData = new ArrayList<Map<String, Object>>();
    for (Entity e: commentEntities) {
        commentData.add(e.getProperties());
    }

    response.setContentType("application/json;");
    response.getWriter().println(convertToJsonUsingGson(commentData));
  }

   @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    /* Only logged-in users can post comments. */
    if (!userService.isUserLoggedIn()) {
    response.sendRedirect("/index.html");
    return;
    }

    String comment = request.getParameter("comment-input");
    long timestamp = System.currentTimeMillis();
    String email = userService.getCurrentUser().getEmail();

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity taskEntity = new Entity("Comment");
    taskEntity.setProperty("text", comment);
    taskEntity.setProperty("timestamp", timestamp);
    taskEntity.setProperty("email", email);
    datastore.put(taskEntity);

    response.sendRedirect("/index.html");
  }

  /**
   * Converts a Array<Map<String, String>> instance into a JSON string using the Gson library.
   */
  private String convertToJsonUsingGson(ArrayList<Map<String, Object>> data) {
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }
}
