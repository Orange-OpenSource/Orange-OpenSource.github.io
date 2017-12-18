/*
 * Orange GitHub repos list viewer - v0.2
 *
 * (C) 2017 Orange, all right reserved
 * olivier.dugeon@orange.com
 * benoit.bailleux@orange.com
 * Licensed under the Apache License, Version 2.0
 */

(function ($, undefined) {

  // Various URLs used by this script
  var Urls = {
    "team_url": "repos/getJson.php?name=teams",
    "repo_url": "repos/getJson.php?name=repos",
    "member_url": "repos/getJson.php?name=members",
    "group_url": "repos/getJson.php?name=groups"
  };

  // Color modulation (see CSS)
  var bgGreys = ["bg-light-grey",
    "bg-grey",
    "bg-dark-grey",
    "bg-very-dark-grey"];
  var bgColor = ["bg-blue",
    "bg-green",
    "bg-pink",
    "bg-yellow",
    "bg-orange",
    "bg-white",
    "bg-grey"];
  var MapRepos = {};
  var MapTeams = {};
  var _members = [];
  var _langStat = {};
  var _lang = [];

  var baseURL = "https://github.com/orgs/Orange-OpenSource";

  // Add a Repo To Carousel
  function createRepoForCarousel(repo, active, image) {
    // Header preparation
    var $repo_head = $("<div>").addClass("caption-header");
    // Repo Title and subtitle
    $repo_head.append($("<h2>").addClass("caption-title")
      .append($("<a>").attr("href", repo.html_url).text(repo.name)));

    // Compute number of star if >= 10
    if (repo.stargazers_count >= 10) {
      var $star = $("<ul>").addClass("list-inline list-stars pull-right");
      var _star_active = repo.stargazers_count / 30;
      var _max_star = 5;
      if (_star_active > _max_star)
        _star_active = _max_star;
      for (var i = 0; i < _star_active; i++)
        $star.append($("<li>").addClass("active").html('<i class="github-star"></i>'));
      $repo_head.append($("<a>").attr("href", repo.html_url + "/stargazers").text('').append($star));
    }

    $repo_head.append($("<p>").addClass("caption-subtitle").text("Made with " + repo.language));

    // Repo information
    var $info = $("<div>").addClass("caption-content");
    $info.append($("<p>").text(repo.description));
    $info.append($("<a>").addClass("btn btn-primary").attr("href", repo.html_url).attr("role", "button").text("View"));
    if (repo.homepage != null && repo.homepage != "")
      $info.append($("<a>").addClass("btn btn-primary").attr("href", repo.homepage).attr("role", "button").text("ReadMe"));
    else
      $info.append($("<a>").addClass("btn btn-default disabled").attr("role", "button").text("ReadMe"));

    // Image
    var $image = $("<div>").addClass("col-md-4 col-xs-12 carousel-img");
    $image.append($("<img>").attr("src", image).attr("alt", "..."));

    // Build the block
    var $item = $("<div>").addClass("item");
    if (active)
      $item.addClass("active");
    $item.append($("<div>").addClass("row")
      .append($("<div>").addClass("col-md-8 col-xs-12")
        .append($("<div>").addClass("carousel-caption")
          .append($repo_head)
          .append($info)))
      .append($image));

    $item.appendTo("#carousel-repos");;
  }

  /* Compute elapse time from now */
  function getUpdateOn(push) {
    currDate = new Date();

    hours = currDate.getHours() - push.getHours();
    days = push.getDay() - currDate.getDay();
    months = currDate.getMonth() - push.getMonth();
    years = currDate.getYear() - push.getYear();
    // console.log("Date Diff: " + years + " ans, " + months + " mois, " + days + " jours, " + hours + " heures");
    if (years > 0)
      return ("Updated " + years + " years ago");
    if (months > 0)
      return ("Updated " + months + " months ago");
    if (days > 0)
      return ("Updated " + days + " days ago");
    if (hours > 0)
      return ("Updated " + hours + " hours ago");
  }

  /* Create information to the "repo card" */
  function createRepo(repo) {
    var $item = $("<section>").addClass("section-repo");
    // Header preparation
    var $repo_head = ($("<div>").addClass("clearfix repo-header")).appendTo($item);
    // Repo Title and subtitle
    var $header = ($("<div>").addClass("pull-left")).appendTo($repo_head);
    $header.append($("<h3>").addClass("repo-title")
      .append($("<a>").attr("href", repo.html_url).text(repo.name)))
      .append($("<p>").addClass("repo-subtitle").text("Made with " + repo.language));
    // Compute number of star if >= 10
    if (repo.stargazers_count >= 10) {
      var $star = $("<ul>").addClass("pull-right list-inline");
      var _star_active = repo.stargazers_count / 30;
      var _max_star = 5;
      if (_star_active > _max_star)
        _star_active = _max_star;
      for (var i = 0; i < _star_active; i++)
        $star.append($("<li>").addClass("active").html('<i class="github-star"></i>'));
      $repo_head.append($("<a>").attr("href", repo.html_url + "/stargazers").text('').append($star));
    }
    // Repo information
    if (repo.description != null)
      $item.append($("<div>").addClass("ellipsis").append($("<p>").text(repo.description)));
    else
      $item.append($("<div>").addClass("ellipsis").append($("<p>").text("")));
    // Footer
    var $repo_footer = ($("<div>").addClass("repo-footer").appendTo($item));
    var $footer = ($("<ul>").addClass("list-inline").appendTo($repo_footer));

    if (repo.homepage != null && repo.homepage != "")
      $footer.append($("<li>").addClass("active").html('<a href="' + repo.homepage + '"><i class="icon-info"></i>Info</a></li>'));
    else
      $footer.append($("<li>").html('<a class=""disabled"><i class="icon-info"></i>Info</a></li>'));

    if (repo.forks > 0)
      $footer.append($("<li>").addClass("active").html('<a href=' + repo.html_url + '/network><i class="github-fork"></i>' + repo.forks + ' forks</a></li>'));
    else
      $footer.append($("<li>").html('<a class="disabled"><i class="github-fork"></i>no fork yet</a></li>'));

    updated = getUpdateOn(new Date(repo.pushed_at));
    $footer.append($("<li>").addClass("active").html('<a href=' + repo.html_url + '/commits><i class="icon-clock"></i> ' + updated));

    return $item;
  }

  /* Add a repository card */
  function addRepo(repo) {
    var card = $("<div>").addClass("col-lg-6 col-xs-12").append(createRepo(repo));
    return card;
  }

  /* Get total number of Orange-OpenSource members */
  var _numMembers = 0;

  function getNumMembers() {

    $.getJSON(Urls["member_url"], function (result) {
      if (result && result.length > 0) {
        _numMembers = result.length;
      } else {
        _numMembers = 0;
      }
    });
  }

  getNumMembers();

  /* Count the number of language */
  function countLang(lang, nbLoC) {
    if (!lang)
      return;
    if (_langStat[lang] == undefined) {
      _langStat[lang] = [1, nbLoC];
    } else {
      _langStat[lang] = [_langStat[lang][0] + 1, _langStat[lang][1] + nbLoC];
    }
  }

  /* Adds the dev language to the list */
  function addLanguage(lang, langList) {
    if (langList) {
      for (var lg in langList) {
        countLang(lg, langList[lg]);
      }
      if (!(lang in langList)) {
        countLang(lang, 0);
      }
    } else {
      countLang(lang, 0);
    }
  }

  /*
     Sort function for Languages
     Which are "{"name" : <languageName>, "nb" : <# of language usage>}"
  */
  function orderLang(a, b) {
    if (a.LoC == b.LoC)
      return 0;
    else if (a.LoC > b.LoC)
      return -1
    else
      return 1
  }

  /* Create a bar diagram based on the most used languages */
  function createBarDiagram() {
    var _lim = 6; // Number of languages to display in the bargraph
    /* Quick and dirty HTML generation : */
    var tab = "<table style='width:100%'>";
    // 150px as the max width:
    var scale = 150 / _lang[0].LoC;
    for (var i = 0; i < _lim; i++) {
      tab += "<tr><td>" + _lang[i].name + "</td><td><span class='barWrapper' style='width:" +
        _lang[i].LoC * scale + "px;' title='used in " + _lang[i].nb +
        " projects'><span class='bar " + bgColor[i % bgColor.length] +
        "'>&nbsp;</span></span></td></tr>";
    }
    tab += "</table>";
    return tab;
  }

  /* Compute a few global indicators */
  function makeStats(repos) {
    // Those are "static" variables !
    _codeVolume = 0;
    _watchers = 0;
    _forks = 0;
    _nbLang = 0;
    _nbRepo = 0;
    $("#stats").text("");

    for (var repo of repos) {
      _nbRepo++;
      _watchers += repo.watchers;
      _codeVolume += repo.size;
      _forks += repo.forks;
      addLanguage(repo.language, repo.languages_list);
    }
    for (var lg in _langStat) {
      _nbLang += _langStat[lg][1];
      _lang.push({
        "name": lg,
        "nb": _langStat[lg][0],
        "LoC": _langStat[lg][1]
      });
      _lang.sort(orderLang);
    }
    // Transform Bytes count into GigaBytes :
    _codeVolume = (_codeVolume / 1024 / 1024).toFixed(2);
    _nbLang = (_nbLang / 1000000).toFixed(2);

    // Produce HTML code
    var $statsList = $("<ul>").addClass("list-inline list-5");
    $statsList.append($("<li>").addClass("round-item")
      .html('<a href = "' + baseURL + '"><span>' + _nbRepo + '</span>precious repos</a>'));
    $statsList.append($("<li>").addClass("round-item")
      .html('<a href = "' + baseURL + '/people"><span>' + _numMembers + '</span>code lovers</a>'));
    $statsList.append($("<li>").addClass("round-item")
      .html('<a href = "' + baseURL + '"><span>' + _watchers + '</span>watchers</a>'));
    $statsList.append($("<li>").addClass("round-item")
      .html('<a href = "' + baseURL + '"><span>' + _codeVolume + '</span>Gb of code</a>'));
    $statsList.append($("<li>").addClass("round-item")
      .html('<a href = "' + baseURL + '"><span>' + _forks + '</span>forks</a>'));
    $statsList.appendTo("#stats");
  }

  // Add Top 3 most active repositories to the Carousel
  function getTopThreeRepo(repos) {

    var topRepo = [null, null, null];
    var LastModified = [null, null, null];

    // Compute Top 3 most active repositories
    for (var repo of repos) {
      // Get the date of last commit
      var pushDate = new Date(repo.pushed_at);

      // Top 1
      if (pushDate > LastModified[0]) {
        LastModified[0] = pushDate;
        topRepo[0] = repo;
      } else {
        // Top 2
        if (pushDate > LastModified[1]) {
          LastModified[1] = pushDate;
          topRepo[1] = repo;
        } else {
          // Top 3
          if (pushDate > LastModified[2]) {
            LastModified[2] = pushDate;
            topRepo[2] = repo;
          }
        }
      }
    }
    // Add the top 3 Repo to the carousel
    createRepoForCarousel(topRepo[0], 1, "img/U4_medium.jpg");
    createRepoForCarousel(topRepo[1], 0, "img/U2_medium.jpg");
    createRepoForCarousel(topRepo[2], 0, "img/U3_medium.jpg");
  }

  function getRepoPerGroupAndTeam() {
    // First get the Group table with Team name
    $.getJSON(Urls["group_url"], function (groups) {
      if (groups && groups.length > 0) {

        // Then get Team table with Repo name
        $.getJSON(Urls["team_url"], function (teams) {
          if (teams && teams.length > 0) {
            // Prepare Team Map
            for (var team of teams) {
              MapTeams[team.slug] = team;
            }

            // Finally get Repo details
            $.getJSON(Urls["repo_url"], function (repos) {
              if (repos && repos.length > 0) {
                // Prepare Repo Map
                for (var repo of repos) {
                  MapRepos[repo.name] = repo;
                }

                // Start processing
                $(function () {
                  // Compute statistics
                  _repos = repos;
                  console.log("Compute Statistics");
                  makeStats(_repos);
                  $("#mostUsedLanguages").html(createBarDiagram());
                  console.log("Compute top 3 repo for the carousel");
                  getTopThreeRepo(_repos);

                  // Initialize Main Navigation bar with groups
                  $("#groupMenu").text("");
                  for (var group of groups) {
                    var active = "";
                    if (group.name == "Home")
                      active = " active";
                    else
                      active = "";

                    console.log("Add group " + group.name);
                    $("#groupMenu").append($("<li>").attr("role", "presentation").addClass(active)
                      .append($("<a>").attr("href", "#" + group.name)
                        .attr("role", "tab").attr("aria-controls", group.name)
                        .attr("data-toggle", "tab").text(group.name)));
                  }
                  // Add Search form
                  /*
                  $("#groupMenu").append($("<li>").addClass("pull-right")
                    .append($("<form>").addClass("navbar-form")
                      .append($("<div>").addClass("form-group")
                        .append($("<input>").addClass("form-control").attr("type", "text").attr("placehoder", "Search")))
                      .append($("<button>").addClass("btn btn-icon").attr("type", "submit")
                        .append($("<i>").addClass("icon-search")))));
                  */
                  // Initialize Teams List
                  $("#teams").text("");

                  // Parse all groups
                  console.log("\nStart processing groups\n");
                  for (var group of groups) {
                    // Initialize Team sub-panel per Group
                    var active = "";
                    if (group.name == "Home")
                      active = " active";
                    else
                      active = "";

                    var $groupID = $("<div>").addClass("tab-pane" + active).attr("role", "tabpanel").attr("id", group.name);
                    var $teamPanel = $("<div>").addClass("col-xs-12");
                    var $teamList = $("<ul>").addClass("nav nav-tabs sub-tabs").attr("role", "tablist");
                    // Initialize repo List per Group
                    var $repoGroup = $("<div>").addClass("tab-content");
                    repo_count = 0;

                    // Parse all teams of the group
                    console.log("\nProcess group " + group.name);
                    // Add All Team in Group sub-panel
                    $teamList.append($("<li>").attr("role", "presentation").addClass("active")
                      .append($("<a>").attr("href", "#All-" + group.name).attr("aria-controls", "All-" + group.name)
                        .attr("role", "tab").attr("data-toggle", "tab")
                        .append($("<i>").addClass("icon-Apps"))
                        .append($("<span>").text("All"))));
                    var $teamAll = $("<div>").addClass("tab-pane active").attr("role", "tabpanel").attr("id", "All-" + group.name);
                    for (var tname of group.teams) {
                      if (tname && MapTeams[tname]) {
                        var team = MapTeams[tname];
                        console.log("  |-> Add team " + team.name);
                        $teamAll.append($("<div>").addClass("col-xs-12").append($("<h3>").text(team.name)));
                        // Add Team in Group sub-panel
                        $teamList.append($("<li>").attr("role", "presentation")
                          .append($("<a>").attr("href", "#" + team.slug).attr("aria-controls", team.slug)
                            .attr("role", "tab").attr("data-toggle", "tab")
                            .append($("<i>").addClass(team.icon))
                            .append($("<span>").text(team.name))));
                        var $repoRow = $("<div>").addClass("tab-pane").attr("role", "tabpanel").attr("id", team.slug);
                        $repoRow.append($("<div>").addClass("col-xs-12").append($("<h3>").text(team.name)));

                        // Parse all repos of the team
                        for (var rname of team.repo) {
                          if (rname && MapRepos[rname]) {
                            // Add repo description
                            repo = MapRepos[rname];
                            // TODO: test if created_at > pushed_at (if yes: this repo has never been updated by Orange)
                            $repoRow.append(addRepo(repo));
                            $teamAll.append(addRepo(repo));
                            repo_count++;
                          }
                        }
                        $repoRow.appendTo($repoGroup);
                      }
                      $teamAll.appendTo($repoGroup);
                    }
                    $teamList.appendTo($teamPanel);
                    // Add Teams and Repos
                    $teamPanel.appendTo($groupID);
                    $repoGroup.appendTo($groupID);
                    // Add Group to Teams
                    $groupID.appendTo($("#teams"));
                  }
                });
              } else {
                $("#teams").text("Error: Could not found Orange repositories");
              }
            });
          } else {
            $("#teams").text("Error: Could not found Orange Teams");
          }
        });
      } else {
        $("#teams").text("Error: Could not found Orange Groups");
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert('Failed with ' + textStatus);
      console.log(errorThrown);
    });
  }

  getRepoPerGroupAndTeam();

})(jQuery);
