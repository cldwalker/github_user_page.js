Description
===========

This github bookmarklet(jQuery plugin) enhances user pages by adding repository sorting, providing additional
repo stats and toggling of forked repositories.


Install
=======

For the bookmarklet to work out of the box you'll need to copy the images to /images/ and the
javascript files to /javascripts/ relative to your web server's root directory.

Usage
=====
This plugin provides two public methods, $.githubUserPage() to activate the
bookmarklet and $.githubRepoSort() to sort repositories. The default bookmarklet looks like this:

    javascript:(function(){$.getScript("http://tagaholic.me/javascripts/jquery.githubUserPage.js",function(){$.githubUserPage()})})()

githubUserPage() has some options that are handy for development. For example if you were developing
on localhost:4000 and wanted to host the images and javascript dependencies the bookmarklet would be:

    javascript:(function(){$.getScript("http://localhost:4000/javascripts/jquery.githubUserPage.js",function(){$.githubUserPage({domain: 'localhost:4000'})})})()

License
=======
MIT License except for the selso jquery plugin dependency which is MIT and GPL licensed.
