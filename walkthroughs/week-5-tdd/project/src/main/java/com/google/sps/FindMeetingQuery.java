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

package com.google.sps;

import java.util.Collection;
import java.util.Collections;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

public final class FindMeetingQuery {

 /*
  * Return true if none of the people in the collection are mandatory attendees of the given event.
  */
  private boolean isFree(Event event, Collection<String> people) {
    Set<String> attendees = event.getAttendees();
    for (String person: people) {
        if (attendees.contains(person)) {
            return false;
        }
    }
    return true;
  }

 /*
  * Return a new TimeRange that merges two existing TimeRanges. Assume range1 and range2 either overlap
  * or contain each other.
  */
  private TimeRange mergeTwoRanges(TimeRange range1, TimeRange range2) {
      int start;
      if (range1.start() < range2.start()) {
          start = range1.start();
      } else {
          start = range2.start();
      }

      int end;
      if (range1.end() > range2.end()) {
        end = range1.end();
      } else {
          end = range2.end();
      }
    return TimeRange.fromStartEnd(start, end, false);
  }

 /*
  * Return true if none of the people in the collection are mandatory attendees of the given event.
  */
  private boolean canBeMerged(TimeRange range1, TimeRange range2) {
    return (range1.overlaps(range2) || range1.contains(range2) || range2.contains(range1) || range1.equals(range2));
  }

 /*
  * Return a new ArrayList<TimeRange> consisting of only time ranges that are not possible to be merged
  * (do not overlap or contain each other).
  */
  private ArrayList<TimeRange> mergeAllRanges(ArrayList<TimeRange> ranges) {
    ArrayList<TimeRange> mergedRanges = new ArrayList<TimeRange>();

    while (ranges.size() > 1) {
        TimeRange first = ranges.get(0);
        TimeRange second = ranges.get(1);
        if (canBeMerged(first, second)) {
            TimeRange mergedRange = mergeTwoRanges(first, second);
            // remove the first two elements of the list
            ranges.remove(0);
            ranges.remove(0);
            ranges.add(mergedRange);
        } else {
            TimeRange fullyMergedRange = first;
            ranges.remove(0);
            mergedRanges.add(fullyMergedRange);
        }
    }
    if (ranges.size() == 1) {
        mergedRanges.add(ranges.get(0));
    }
    return mergedRanges;
  }

 /* 
  * Return whether or not the given possible range for a meeting is valid (start and end times are possible and 
  * the given time range is long enough to fit the meeting). 
  */
  private boolean isValidMeetingRange(TimeRange possibleRange, long duration) {
      return (possibleRange.end() > possibleRange.start() && possibleRange.duration() >= duration);
  }

  /* 
   * Return a collection of TimeRanges representing the free gaps in between the merged blocked time ranges. 
   */
  private Collection<TimeRange> getFreeRanges(ArrayList<TimeRange> mergedBlockedRanges, long duration) {
    Collection<TimeRange> freeRanges = new ArrayList<TimeRange>();
    int start = TimeRange.START_OF_DAY;
    int end = TimeRange.END_OF_DAY;
    for (TimeRange range: mergedBlockedRanges) {
        end = range.start();
        TimeRange freeRange = TimeRange.fromStartEnd(start, end, false);
        if (isValidMeetingRange(freeRange, duration)) {
            freeRanges.add(freeRange);
        }
        start = range.end();
    }
    end = TimeRange.END_OF_DAY;
    TimeRange freeRange = TimeRange.fromStartEnd(start, end, true);
    if (isValidMeetingRange(freeRange, duration)) {
        freeRanges.add(freeRange);
    }
    return freeRanges;
  }

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
        return new ArrayList<TimeRange>();
    }
    ArrayList<TimeRange> blockedOptRanges = new ArrayList<TimeRange>();

    /* Add TimeRanges for Events where attendees from the request are not free. */
    events.forEach((event) -> { 
        Collection<String> allAttendees = new ArrayList<String>();
        allAttendees.addAll(request.getAttendees());
        allAttendees.addAll(request.getOptionalAttendees());
        if (!isFree(event, allAttendees)) {
            blockedOptRanges.add(event.getWhen()); 
        }
    });
    Collections.sort(blockedOptRanges, TimeRange.ORDER_BY_START);
    ArrayList<TimeRange> mergedOptRanges = mergeAllRanges(blockedOptRanges);
    Collection<TimeRange> freeRanges = getFreeRanges(mergedOptRanges, request.getDuration());

    // If one or more slots exist with optional attendees or there are no mandatory attendees, return these slots.
    if (freeRanges.size() > 0 || request.getAttendees().size() == 0) {
        System.out.println("one or more slots exist for optional attendees");
        return freeRanges;
    } else { // find time slots just for mandatory attendees
    
        ArrayList<TimeRange> blockedRanges = new ArrayList<TimeRange>();

        /* Add TimeRanges for Events where attendees from the request are not free. */
        events.forEach((event) -> { 
            if (!isFree(event, request.getAttendees())) {
                blockedRanges.add(event.getWhen()); 
            }
        });
        Collections.sort(blockedRanges, TimeRange.ORDER_BY_START);
        ArrayList<TimeRange> mergedRanges = mergeAllRanges(blockedRanges);
        System.out.println("just mandatory attendees");
        return getFreeRanges(mergedRanges, request.getDuration());
    }
  }

}
