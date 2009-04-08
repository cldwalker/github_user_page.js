(function($) {
  var plugin_domain;
  var forked_repository_ids;

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
      // Also needed for toggling forked repos.
      $('li.project').each(function(i,e){ $(e).attr('id','repo-'+ i) });
      sourceSortPlugin();
      createSortBox();
      setupForkedToggle();
      addRepoStats(json.user.repositories);
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
    else if (field == 'date') {
      $('li.project').selso({type: 'num', direction: sort_direction,
        extract: function(obj) {
          var date_time = $(obj).find('div.meta abbr').attr('title').match(/(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/);
          return Date.UTC(date_time[1], date_time[2], date_time[3], date_time[4], date_time[5], date_time[6]);
        }
      });
      $("a.date_sort").toggle();
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
    $('div.title', 'li.project').each(function() {
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
      <span id='sort_links_label'>SORT:</span>\
      <span class='sort_label'>NAME</span>\
      <a class='name_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('name', 'asc')\"></a>\
      <a class='name_sort desc_sort' href=\"javascript:$.githubRepoSort('name', 'desc')\"></a>\
      | <span class='sort_label'>WATCHERS</span>\
      <a class='watchers_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('watchers', 'asc')\"></a>\
      <a class='watchers_sort desc_sort' href=\"javascript:$.githubRepoSort('watchers', 'desc')\"></a>\
      | <span class='sort_label'>FORKS</span>\
      <a class='forks_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('forks', 'asc')\"></a>\
      <a class='forks_sort desc_sort' href=\"javascript:$.githubRepoSort('forks', 'desc')\"></a>\
      | <span class='sort_label'>UPDATED</span>\
      <a class='date_sort asc_sort' style='display:none' href=\"javascript:$.githubRepoSort('date', 'asc')\"></a>\
      <a class='date_sort desc_sort' href=\"javascript:$.githubRepoSort('date', 'desc')\"></a><br/>\
      <a id='toggle_forked_repositories'>Toggle Forked Repositories</a><br/>\
    </div>\
    ");
  };

  function setupForkedToggle() {
    forked_repository_ids = $.grep($('li.project'), function(e) {return $(e).find('div.meta').text().match('Forked from')}).map(
      function(f) { return '#'+$(f).attr('id') });
    $("#toggle_forked_repositories").click( function(){
      $(forked_repository_ids.join(',')).toggle();
      void(0);
    });
    $("#toggle_forked_repositories").html("Toggle "+$(forked_repository_ids).size()+ " Forked Repositories");
  };

  function sum(array) {
    var total = 0;
    $.each(array, function() { total += this});
    return total;
  };

  function average(array) { return (sum(array) / $(array).size()).toFixed(1);}

  function addRepoStats(repositories) {
    var nonforked_repos = $.grep(repositories, function(e) { return !e.fork });
    var forked_repos = $.grep(repositories, function(e) { return e.fork });
    addStat("Non-Fork/Fork:", $(nonforked_repos).size()+" / "+$(forked_repos).size() );

    var nonforked_watcher_average = average(nonforked_repos.map(function(e) {return e.watchers}));
    var forked_watcher_average = average(forked_repos.map(function(e) {return e.watchers}));
    addStat("Watcher Average:", nonforked_watcher_average+" / "+ forked_watcher_average );

    var nonforked_fork_average = average(nonforked_repos.map(function(e) {return e.forks}));
    var forked_fork_average = average(forked_repos.map(function(e) {return e.forks}));
    addStat("Fork Average:", nonforked_fork_average+" / "+forked_fork_average );
  };

  function addStat(label, data) {
    $('div.info').append("<div class='field'><label>"+label+"</label><div> "+data+" </div></div>");
  };
})(jQuery);