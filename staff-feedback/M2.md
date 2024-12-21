# Milestone M2: Team Feedback

This milestone M2 provides an opportunity to give you, as a team, formal feedback on how you are performing in the project. By now, you should be building upon the foundations set in M1, achieving greater autonomy and collaboration within the team. This is meant to complement the informal, ungraded feedback from your coaches given during the weekly meetings or asynchronously on Discord, email, etc.

The feedback focuses on two major themes:
First, whether you have adopted good software engineering practices and are making progress toward delivering value to your users.
Is your design and implementation of high quality, easy to maintain, and well tested?
Second, we look at how well you are functioning as a team, how you organize yourselves, and how well you have refined your collaborative development.
An important component is also how much you have progressed, as a team, since the previous milestone.
You can find the evaluation criteria in the [M2 Deliverables](https://github.com/swent-epfl/public/blob/main/project/M2.md) document.
As mentioned in the past, the standards for M2 are elevated relative to M1, and this progression will continue into M3.

We looked at several aspects, grouped as follows:

 - Design
   - [Features](#design-features)
   - [Design Documentation](#design-documentation)
 - [Implementation and Delivery](#implementation-and-delivery)
 - Scrum
   - [Backlogs Maintenance](#scrum-backlogs-maintenance)
   - [Documentation and Ceremonies](#scrum-documentation-and-ceremonies)
   - [Continuous Delivery of Value](#scrum-continuous-delivery-of-value)

## Design: Features

We interacted with your app from a user perspective, assessing each implemented feature and flagging any issues encountered. Our evaluation focused mainly on essential features implemented during Sprints 3, 4, and 5; any additional features planned for future Sprints were not considered in this assessment unless they induced buggy behavior in the current APK.
We examined the completeness of each feature in the current version of the app, and how well it aligns with user needs and the overall project goals.


Overall the app is not very useful yet, in a real situation, most features are broken or not fully completed. You should focus on the essentials, focus more on the main scenarios of usage of your app


For this part, you received 4.8 points out of a maximum of 8.0.

## Design: Documentation

We reviewed your Figma (including wireframes and mockups) and the evolution of your overall design architecture in the three Sprints.
We assessed how you leveraged Figma to reason about the UX, ensure a good UX, and facilitate fast UI development.
We evaluated whether your Figma and architecture diagram accurately reflect the current implementation of the app and how well they align with the app's functionality and structure.


The figma is up to date, you could make it even more perfect by being ahead of the app.

The architecture diagram is much better than last milestone.


For this part, you received 5.4 points out of a maximum of 6.0.

## Implementation and Delivery

We evaluated several aspects of your app's implementation, including code quality, testing, CI practices, and the functionality and quality of the APK.
We assessed whether your code is well modularized, readable, and maintainable.
We looked at the efficiency and effectiveness of your unit and end-to-end tests, and at the line coverage they achieve.


The codebase is decent overall, but there are areas to improve. Some functions are longer than they reasonably should be (as an example take the function handleUpload in CaptureMediaScreen), and the numbered comments (1/2/3, etc. that explain each steps in this large function) appear to mask an underlying issue with fine-grained modularization. In general, you could break down these large functions further into smaller, more focused sub-functions. This approach would align better with the Single Level of Abstraction principle and make your code easier to read and maintain.

The CI must absolutely be setup, this is impacting a lot your overall performance, some broken code get merged in main and then you are all unable to merge your future PRs with all tests passing. CI must run and give clear information on: are all of your tests passing. If you don't have the CI doing this automatically, please make sure to inform everyone reading your PR conversation that you have the information that the reviewer actually tested as well on his local machine what passed or not?

Concerning APK, it should be made as a production build so that we can use it without having to run a "npx expo start" local server. Concerning the functionality the signup and login worked okay. After sucessfully creating a landlord profile, the app made a white screen, we had to restart the app to get to the home/dashboard page. Concerning the washing machines marking maintnance button did crash (an assert check wasn't fullfilled) no popup error message was provided.


For this part, you received 10.8 points out of a maximum of 16.0.

## Scrum: Backlogs Maintenance

We looked at whether your Scrum board is up-to-date and well organized.
We evaluated your capability to organize Sprint 6 and whether you provided a clear overview of this planning on the Scrum board.
We assessed the quality of your user stories and epics: are they clearly defined, are they aligned with a user-centric view of the app, and do they suitably guide you in delivering the highest value possible.


Excellent planing, we see that you captured the priorities and have assigned right amount of tasks, and of reasonable estimated time. The product backlog is updated and you searched for external feedback on the app.


For this part, you received 4 points out of a maximum of 4.0.

## Scrum: Documentation and Ceremonies

We assessed how you used the Scrum process to organize yourselves efficiently.
We looked at how well you documented your team Retrospective and Stand-Up during each Sprint.
We also evaluated your autonomy in using Scrum.


Scrum documents were fullfilled in advance every week before the friday sprint meetings which is great. Make sure to repeat them during the scrum meetings. It is important that the document helps you think for a list of things you will mention is the meeting and not suppose that everyone is aware of it. The goal is to explicitly mention every points (especially the "things to improve" section)

The scrum meetings are a bit messy, it is important to not go very deeply in the implementation details when it can be avoided. Try to stay a bit more high level. You should be leading more your friday meeting, the scrum master should be more structured and organized. The scrum master should take a more structured and organized approach to leading the friday meetings. At times, the pace is too slow, or the Scrum Master doesn't take enough lead, which leads to overly detailed discussions.

Concerning the autonomy you can definitely imporve this point. Come to the meetings with a clear structure in head. This can make the meeting shorter as well and you can go start working on your following sprint ;)


For this part, you received 3.6 points out of a maximum of 4.0.

## Scrum: Continuous Delivery of Value

We evaluated the Increment you delivered at the end of each Sprint, assessing your team’s ability to continuously add value to the app.
This included an assessment of whether the way you organized the Sprints was conducive to an optimal balance between effort invested and delivery of value.


The app is envolving at a consistent peace, but the actual features could be more impactful. You focused a lot on the navigation screen and signup/login (which indeed are complex parts of the app architecture) but you should have part of your team working on additional important features (chat for instance) so that you suceed in having a useful app.


For this part, you received 1.2 points out of a maximum of 2.0.

## Summary

Based on the above points, your intermediate grade for this milestone M2 is 4.72. If you are interested in how this fits into the bigger grading scheme, please see the [project README](https://github.com/swent-epfl/public/blob/main/project/README.md) and the [course README](https://github.com/swent-epfl/public/blob/main/README.md).

Your coaches will be happy to discuss the above feedback in more detail.

Good luck for the next Sprints!
