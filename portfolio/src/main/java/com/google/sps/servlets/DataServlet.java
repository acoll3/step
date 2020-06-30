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
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.RequestDispatcher;
import com.google.gson.*;

/** Servlet that returns some example content. */
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  ArrayList<String> comments = new ArrayList<String>();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    int numComments = Integer.parseInt(request.getParameter("number"));

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    ArrayList<String> comments = new ArrayList<String>();
    Iterator<Entity> iter = results.asIterable().iterator();
    for (int i = 0; i < numComments; i++) {
        Entity e = iter.next();
        String comment = (String) e.getProperty("text");
        comments.add(comment);
    }
    response.setContentType("application/json;");
    response.getWriter().println(convertToJsonUsingGson(comments));
  }

   @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String comment = request.getParameter("comment-input");
    long timestamp = System.currentTimeMillis();

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity taskEntity = new Entity("Comment");
    taskEntity.setProperty("text", comment);
    taskEntity.setProperty("timestamp", timestamp);
    datastore.put(taskEntity);

    response.sendRedirect("/index.html");
  }

  /**
   * Converts an ArrayList instance into a JSON string using the Gson library.
   */
  private String convertToJsonUsingGson(ArrayList<String> comments) {
    Gson gson = new Gson();
    String json = gson.toJson(comments);
    return json;
  }
}
