(function($) {
  var plugin_domain;

  // These options are mainly useful while developing on the bookmarklet.
  //Options:
  // * user: github user i.e. defunkt, defaults to scraping it from the current url
  // * domain: domain from which images and javascript dependencies are served, defaults to tagaholic.me, images
  //   are assumed to be under /images and javascript files under /javascripts
  $.githubUserPage = function(options) {
    options = $.extend({domain: 'tagaholic.me', user: location.href.match(/([^\/]+)\/?$/)[1]}, options || {})
    plugin_domain = options.domain;
    displayBookmarkletStatus(options.user);
    $.getJSON("http://github.com/api/v1/json/"+options.user +"?callback=?", function(json) {
      loadRepoStats(json);
      // Adding ids to the repo boxes because they are required by the sort plugin and repos don't have them.
      $('li.project').each(function(i,e){ $(e).attr('id','repo-'+ i) });
      sourceSortPlugin();
      createSortBox();
    });
  };

  $.githubRepoSort = function(field, sort_direction) {
    if (field == 'name') {
      $('li.project').selso({orderBy:'div.title a', type:'alpha', direction:sort_direction});
      $("a.name_sort").toggle();
    }
    else if (field == 'watchers'){
      $('li.project').selso({orderBy:'span.watchers_num', type:'num', direction:sort_direction});
      $("a.watchers_sort").toggle();
    }
    else if (field == 'forks') {
      $('li.project').selso({orderBy:'span.forks_num', type:'num', direction:sort_direction});
      $("a.forks_sort").toggle();
    }
  };

  //private methods
  function displayBookmarkletStatus(github_user) {
    $("ul.projects").before("<div id='bookmarklet_status' style='text-align:center;padding:2px;margin-top:20px;border:1px solid #D8D8D8;\
      background-color: #F0F0F0;'>Fetching data for "+github_user+"...<img src='http://github.com/images/modules/ajax/indicator.gif'/></div>");
  };

  function detect(array, callback) {
    return $.grep(array,callback)[0];
  };

  function addRepo(repo_div, json_repo) {
    repo_div.before("<span style='float:right; color:#4183C4'><span class='watchers_num'>" + json_repo.watchers + "</span> watchers<br/>" + 
      "<span class='forks_num'>" + json_repo.forks + "</span> forks" + '</span>');
  };

  function loadRepoStats(json) {
    $('div.title').each(function() {
      var repo_div = $(this);
      var repo_obj = detect(json.user.repositories, function(e) {
        return e.name == repo_div.text();
      });
      if (repo_obj) {addRepo(repo_div, repo_obj);}
    });
  };

  function sourceSortPlugin() {
    var _s = document.createElement('script');
    _s.type='text/javascript';
    // original source: 'http://plugins.jquery.com/files/jquery.selso-1.0.1.js.txt'
    _s.src='http://'+ plugin_domain +'/javascripts/jquery.selso.js';
    document.getElementsByTagName('head')[0].appendChild(_s);
  };

  function createSortBox() {
    $('#bookmarklet_status').replaceWith("\
    <style type='text/css'>\
      .desc_sort {\
        background: url(http://"+plugin_domain+"/images/arrow-down.gif) no-repeat 0 center;\
        padding: 0 10px;\
      }\
      .asc_sort {\
        background: url(http://"+plugin_domain+"/images/arrow-up.gif) no-repeat 0 center;\
        padding: 0 10px;\
      }\
      .sort_label {\
        font-weight: bold;\
        color:#4183C4;\
      }\
      #sort_links {\
        text-align:center;\
        padding:2px;\
        margin-top:20px;\
        border:1px solid #D8D8D8;\
        background-color: #F0F0F0;\
      }\
      #sort_links_label {\
        font-style: italic;\
        font-size: 120%;\
        padding-right:10px;\
        color:#888;\
      }\
    </style>\
    <div id='sort_links'>\
      <span id='sort_links_label'>Sort Repositories:</span>\
      <span class='sort_label'>NAME</span>\
      <a class='name_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('name', 'asc')\"></a>\
      <a class='name_sort desc_sort' href=\"javascript:$.githubRepoSort('name', 'desc')\"></a>\
      | <span class='sort_label'>WATCHERS</span>\
      <a class='watchers_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('watchers', 'asc')\"></a>\
      <a class='watchers_sort desc_sort' href=\"javascript:$.githubRepoSort('watchers', 'desc')\"></a>\
      | <span class='sort_label'>FORKS</span>\
      <a class='forks_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('forks', 'asc')\"></a>\
      <a class='forks_sort desc_sort' href=\"javascript:$.githubRepoSort('forks', 'desc')\"></a>\
    </div>\
      ");
  };
})(jQuery);