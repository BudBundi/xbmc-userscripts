// ==UserScript==
// @name            YouTube » XBMC
// @namespace       http://userscripts.org/users/53793/scripts
// @description     Play YouTube videos on your XBMC
// @include         *youtube.tld/*
// @include         file:///home/john/Work/youtube-xbmc-js/*
// @version         1.0.2
// @date            2012-07-11
// @author          xlotlu
// @updateURL       http://userscripts.org/scripts/source/136934.meta.js
// ==/UserScript==

(function () {

// the script will stop the currently playing video on youtube
// when something is sent to XBMC.
// if you don't want this behaviour, change this to false:
var stop_on_play = true;

var xbmc_address = GM_getValue('XBMC_ADDRESS');
GM_registerMenuCommand('Modify the XBMC address', modify_xbmc_address);
if (xbmc_address === undefined) modify_xbmc_address();

function modify_xbmc_address() {
	xbmc_address = window.prompt(
        'Enter the address for the XBMC web interface\n(username:password@address:port)',
        xbmc_address
    );
	GM_setValue("XBMC_ADDRESS", xbmc_address);
}

var BUTTON_ID = 'xbmc-actions';

var ACTIONS = {
    add:        {
                    action: video_add,
                    caption: 'Enqueue'
                },
    insert:     {
                    action: video_insert,
                    caption: 'Play next'
                },
    play:       {
                    action: video_play,
                    caption: 'Play now'
                },
    replace:    {
                    action: video_replace,
                    caption: 'Replace playlist'
                }
};

var DEFAULT_ACTION = 'add';


function stop_playing() {
    var player;
    try {
        player = unsafeWindow.yt.player.playerReferences_.player1.api;
    } catch(err) {
        return;
    }

    if (player && player.stopVideo) player.stopVideo();
}

function get_video_id(url) {
    var match = url.match(/\bv=([\w-]+)/);
    return match ? match[1] : null;
}

var debug = true;
function status(type, response) {
    if (debug) {
        console.log(type, JSON.parse(response.responseText));
    }
}

function play(video_id) {
    console.log('playing', video_id);
    return;



    var url = 'plugin://plugin.video.youtube/?path=/root/video&action=play_video&videoid=' + video_id;

    var command =  {
        jsonrpc: "2.0",
        method: "Player.Open",
        params: {
            item: {
                file: url
            }
        },
        id : 1
    };
    /*
    var command = [{
        jsonrpc: "2.0",
        method: "Playlist.Add",
        params: {
            item: {
                file: url
            },
            playlistid: 1
        },
        id: 1
    },
    {
        jsonrpc: "2.0",
        method: "Player.Open",
        params: {
            item: {
                playlistid: 1,
                position: 0
            }
        },
        id : 2
    }];
    */

    var details = {
        method : 'POST',
        url : 'http://' + xbmc_address + '/jsonrpc',
        headers : {'Content-Type': 'application/json'},
        data : JSON.stringify(command),
        onabort : function (response){ status("onabort", response) },
        onerror : function (response){ status("onerror", response) },
        onload : function (response){ status("onload", response) },
        onprogress : function (response){ status("onprogress", response) },
        onreadystatechange : function (response){ status("onreadystatechange", response) },
        ontimeout  : function (response){ status("ontimeout", response) }
    };

    console.log(GM_xmlhttpRequest(details));
}


function send(command, parameters, callback) {
    if (!parameters) parameters = {}

    var request = {
        method : 'POST',
        url : 'http://' + xbmc_address + '/jsonrpc',
        headers : {'Content-Type': 'application/json'},
        data : JSON.stringify({
            jsonrpc: "2.0",
            method: command,
            params: parameters
        }),
        "id": 1
    };
    if (callback) request.onload = callback;

    GM_xmlhttpRequest(request);
}


//setTimeout(function(){ get_status() } , 20);

function get_status(continue_with) {
    if (continue_with) 
    send("Player.GetProperties", {
        "playerid": 1,
        "properties": ["playlistid", "position", "speed"]
    }, function(outside_data) {
        return function(response) {
            console.log(response);
            console.log(outside_data);
        }
    }('something something')
    )
    // returns either
    // "error": {
    //     "code": -32100,
    //     "message": "Failed to execute method."
    // },
    // or
    // "result": {
    //     "playlistid": 1,
    //     "position": 0,
    //     "speed": 1
    // }
}

function play() {
    get_status()
}
function _play(video, something) {

}

function video_play(video_id) {
    console.log("play", video_id);
    // get_info;
    // on return, batch:
    //      insert at some position
    //      open playlist or advance
    //
    // find current position, if any!
    // send:
    //   "Playlist.Insert",
    //   {
    //       "item": {
    //           "file": $X
    //       },
    //       "playlistid": 1,
    //       "position": $Y
    //   }
    // if not playing,
    // Player.Open "playlistid": 1
    // else,
    // Player.GoNext "playerid": 1
}

function video_add(video_id) {
    console.log("add", video_id);
    // get_info;
    // on return open playlist or nothing
    // 
    // send:
    //   "Playlist.Add",
    //   {
    //       "playlistid": 1
    //       "item": {
    //           "file": $X
    //       }
    //   }
    // if not playing,
    // Player.Open "playlistid": 1
}

function video_insert(video_id) {
    console.log("insert", video_id);
    // get_info;
    // on return, either insert, or batch:
    //      insert
    //      open playlist
    //
    // same as play,
    // Player.Open if not playing,
    // else do nothing
}

function video_replace(video_id) {
    console.log("replace", video_id);
    // batch:
    //      stop
    //      clear playlist
    //      insert into playlist
    //      open playlist
    //
    // Playlist.Clear "playlistid": 1
    // then all the stuff from play
}


/*
Going playlisty:

# xbmc() { curl -s -H 'Content-Type: application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "'"$1"'", "params": {'"$2"'}}'  http://xbmc:none@localhost:8080/jsonrpc | python -mjson.tool | pygmentize -l json; }

»»»
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "Player.GetActivePlayers",
    "params": {}
}

«««
// if there is no active player:
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": []
}
// else
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": [
        {
            "playerid": 1,
            "type": "video"
        }
    ]
}


»»»
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "Player.GetProperties",
    "params": {
        "playerid": 1,
        "properties": [
            "playlistid",
            "position",
            "speed"
        ]
    }
}

«««
// if the above said there's no player:
{
    "error": {
        "code": -32100,
        "message": "Failed to execute method."
    },
    "id": 1,
    "jsonrpc": "2.0"
}
// else:
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        // playlistid 1 is the video playlist,
        // it will always be the one playing if a video is playing.
        "playlistid": 1,
        // when position is -1, a single video is playing,
        // NOT the video playlist (id 1).
        // NB: normal playlist positions start from 0.
        "position": -1,
        // speed 0: video stopped,
        // speed 1: running
        "speed": 0
    }
}


The user can:

1. Add to playlist.
Default action. The item is appended.

»»»
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "Playlist.Add",
    "params": {
        "playlistid": 1
        "item": {
            "file": "..."
        }
    }
}

2. Enqueue.
Must find another name. The item is inserted after the now-playing.
(i.e. the position result from above)

»»»
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "Playlist.Insert",
    "params": {
        "item": {
            "file": "..."
        },
        "playlistid": 1,
        "position": 1
    }
}

3. Play.
Gets inserted as above, but also:

»»»
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "Player.GoNext",
    "params": {
        "playerid": 1
    }
}


We'll need to decide when to Player.Open "playlistid": 1 at what position.


This might be needed:

»»»
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "Playlist.GetItems",
    "params": {
        "playlistid": 1
    }
}

«««
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        "items": [
            {
                "label": "something something",
                "type": "movie"
            },
            {
                "label": "",
                "type": "unknown"
            }
        ],
        "limits": {
            "end": 2,
            "start": 0,
            "total": 2
        }
    }
}

*/





// the pretty stuff
var PIXEL_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
var BUTTONS_IMG = 'data:image/png;base64,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';

GM_addStyle('\
    span.xbmc-actions>button { position: static; left: auto; top: auto; right: auto; bottom: auto; } \
    \
    span.xbmc-actions>button.xbmc-button { float: left; } \
    \
    span.xbmc-actions>button.xbmc-button>span { display: block; float: left; } \
    span.xbmc-actions>button.xbmc-button>span>img { float: left; } \
    \
    span.xbmc-actions>button.xbmc-dropdown { padding: 0 5px; } \
    \
    span.xbmc-actions>ul.yt-uix-button-menu {} \
    \
    span.xbmc-actions>button.xbmc-button>span, span.xbmc-actions>button>span>img, span.xbmc-actions>ul.yt-uix-button-menu>li>a.yt-uix-button-menu-item>img { background-image: url("' + BUTTONS_IMG + '"); background-repeat: no-repeat; } \
    \
    \
    span.xbmc-actions.small { position: absolute; left: 2px; bottom: 2px; width: 70px; } \
    span.xbmc-actions.small>button>span>img { height: 11px; } \
    \
    span.xbmc-actions.small>button.xbmc-button { width: 60px; } \
    span.xbmc-actions.small>button.xbmc-button>span { width: 56px; height: 11px; background-position: 15px -46px; } \
    span.xbmc-actions.small>button.xbmc-button>span>img { margin-left: 2px; width: 15px; } \
    span.xbmc-actions.small>button.xbmc-button.play>span>img { background-position: -60px -46px; } \
    span.xbmc-actions.small>button.xbmc-button.add>span>img { background-position: -80px -46px; } \
    span.xbmc-actions.small>button.xbmc-button.insert>span>img { background-position: -100px -46px; } \
    span.xbmc-actions.small>button.xbmc-button.replace>span>img { background-position: -120px -46px; } \
    \
    span.xbmc-actions.small>button.xbmc-dropdown { width: 14px; } \
    span.xbmc-actions.small>button.xbmc-dropdown>span>img { width: 8px; background-position: -141px -46px; } \
    \
    span.xbmc-actions.small>ul.yt-uix-button-menu {top: auto !important; bottom: 22px; left: 0 !important; padding: 3px 0; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li>a.yt-uix-button-menu-item {padding: 3px 10px; font-size: 11px; color: #555; line-height: 13px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li>a.yt-uix-button-menu-item:hover {color: #fff; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li>a.yt-uix-button-menu-item>img {width: 15px; height: 13px; margin: 0 1px 0 -7px; vertical-align: text-bottom; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.play>a.yt-uix-button-menu-item>img {background-position: -60px -45px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.play>a.yt-uix-button-menu-item:hover>img {background-position: -60px -58px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.add>a.yt-uix-button-menu-item>img {background-position: -80px -45px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.add>a.yt-uix-button-menu-item:hover>img {background-position: -80px -58px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.insert>a.yt-uix-button-menu-item>img {background-position: -100px -45px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.insert>a.yt-uix-button-menu-item:hover>img {background-position: -100px -58px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.replace>a.yt-uix-button-menu-item>img {background-position: -120px -45px; } \
    span.xbmc-actions.small>ul.yt-uix-button-menu>li.replace>a.yt-uix-button-menu-item:hover>img {background-position: -120px -58px; } \
    \
    span.xbmc-actions.large { } \
    span.xbmc-actions.large.inline>button { margin-top: 4px; } \
    \
    span.xbmc-actions.large>button>span>img { height: 15px; } \
    \
    span.xbmc-actions.large>button.xbmc-button { width: 74px; } \
    span.xbmc-actions.large>button.xbmc-button>span { width: 72px; height: 15px; background-position: 20px 0; } \
    span.xbmc-actions.large>button.xbmc-button:hover>span { background-position: 20px -15px; } \
    span.xbmc-actions.large>button.xbmc-button>span>img { margin-left: 3px; width: 17px; } \
    span.xbmc-actions.large>button.xbmc-button.play>span>img { background-position: -60px 0; } \
    span.xbmc-actions.large>button.xbmc-button.play:hover>span>img { background-position: -60px -15px; } \
    span.xbmc-actions.large>button.xbmc-button.add>span>img { background-position: -80px 0; } \
    span.xbmc-actions.large>button.xbmc-button.add:hover>span>img { background-position: -80px -15px; } \
    span.xbmc-actions.large>button.xbmc-button.insert>span>img { background-position: -100px 0; } \
    span.xbmc-actions.large>button.xbmc-button.insert:hover>span>img { background-position: -100px -15px; } \
    span.xbmc-actions.large>button.xbmc-button.replace>span>img { background-position: -120px 0; } \
    span.xbmc-actions.large>button.xbmc-button.replace:hover>span>img { background-position: -120px -15px; } \
    \
    span.xbmc-actions.large>button.xbmc-dropdown { width: 18px; } \
    span.xbmc-actions.large>button.xbmc-dropdown>span>img { width: 10px; background-position: -141px 0; } \
    span.xbmc-actions.large>button.xbmc-dropdown:hover>span>img { background-position: -141px -15px; } \
    \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li>a.yt-uix-button-menu-item {padding: 6px 15px 5px 17px; line-height: 15px; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li>a.yt-uix-button-menu-item>img {width: 17px; height: 15px; margin: 0 1px 1px -13px; vertical-align: text-bottom; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.play>a.yt-uix-button-menu-item>img {background-position: -60px 0; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.play>a.yt-uix-button-menu-item:hover>img {background-position: -60px -30px; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.add>a.yt-uix-button-menu-item>img {background-position: -80px 0; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.add>a.yt-uix-button-menu-item:hover>img {background-position: -80px -30px; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.insert>a.yt-uix-button-menu-item>img {background-position: -100px 0; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.insert>a.yt-uix-button-menu-item:hover>img {background-position: -100px -30px; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.replace>a.yt-uix-button-menu-item>img {background-position: -120px 0; } \
    span.xbmc-actions.large>ul.yt-uix-button-menu>li.replace>a.yt-uix-button-menu-item:hover>img {background-position: -120px -30px; } \
');

// the hands on stuff
function mkButtons(large) {
    if (!this.default_action) {
        this.default_action = ACTIONS[DEFAULT_ACTION];
        delete(ACTIONS[DEFAULT_ACTION]);
    }

    // the main container
    var actions = document.createElement('span');
    actions.setAttribute('class', 'xbmc-actions yt-uix-button-group ' + (large ? 'large' : 'video-actions small'));

    // the default action
    var _button = document.createElement('button');
    _button.setAttribute('class', 'xbmc-button start yt-uix-button yt-uix-button-default yt-uix-tooltip ' + DEFAULT_ACTION + (large ? ' yt-uix-button-empty' : ' addto-button'));
    _button.setAttribute('title', this.default_action.caption + ' in XBMC');
    _button.setAttribute('type', 'button');
    _button.setAttribute('role', 'button');
    _button.setAttribute('onclick', ';return false;');
    actions.appendChild(_button);

    // doing what?
    _button._action = this.default_action.action;
    _button.addEventListener('click', function(event) {
        this._action(this.parentNode.parentNode._video_id);
        event.preventDefault();
    }, false);

    var _wrapper = document.createElement('span');
    _wrapper.setAttribute('class', large ? 'yt-uix-button-wrapper' : 'yt-uix-button-content');
    _button.appendChild(_wrapper);

    if (!large) {
        var _label = document.createElement('span');
        _label.setAttribute('class', 'addto-label');
        _label.appendChild(document.createTextNode(this.default_action.caption + ' in XBMC'));
        _wrapper.appendChild(_label);
    }

    var _empty = document.createElement('img');
    _empty.setAttribute('src', PIXEL_IMG);
    if (large) _empty.setAttribute('class', 'yt-uix-button-icon');
    _wrapper.appendChild(_empty);

    // the dropdown button
    var _dropdown = document.createElement('button');
    _dropdown.setAttribute('class', 'xbmc-dropdown end yt-uix-button yt-uix-button-default ' + (large ? 'yt-uix-button-empty' : 'addto-button'));
    _dropdown.setAttribute('type', 'button');
    _dropdown.setAttribute('role', 'button');
    _dropdown.setAttribute('onclick', ';return false;');
    _dropdown.setAttribute('data-button-has-sibling-menu', 'true');
    _dropdown.setAttribute('aria-haspopup', 'true');
    actions.appendChild(_dropdown);

    var _wrapper = document.createElement('span');
    _wrapper.setAttribute('class', large ? 'yt-uix-button-wrapper' : 'yt-uix-button-content');
    _dropdown.appendChild(_wrapper);

    var _empty = document.createElement('img');
    _empty.setAttribute('src', PIXEL_IMG);
    if (large) _empty.setAttribute('class', 'yt-uix-button-icon');
    _wrapper.appendChild(_empty)

    // the dropdown menu
    var _menu = document.createElement('ul');
    _menu.setAttribute('class', 'yt-uix-button-menu yt-uix-button-menu-default');
    _menu.setAttribute('style', 'display: none;');
    _menu.setAttribute('role', 'menu');
    _menu.setAttribute('aria-haspopup', 'true');
    _dropdown.appendChild(_menu);

    for (var action in ACTIONS) {
        var _item = document.createElement('li');
        _item.setAttribute('role', 'menuitem');
        _item.setAttribute('class', action);
        _menu.appendChild(_item);
        
        var _action = document.createElement('a');
        _action.setAttribute('class', 'yt-uix-button-menu-item');
        _action.href = '#xbmc-' + action;
        _action.setAttribute('onclick', ';return false;');
        _item.appendChild(_action);
        
        var _empty = document.createElement('img');
        _empty.setAttribute('src', PIXEL_IMG);
        _action.appendChild(_empty)        
        _action.appendChild(document.createTextNode(ACTIONS[action].caption));
        
        // actually doing something
        _action._action = ACTIONS[action].action;
        _action.addEventListener('click', function(event) {
            this._action(this.parentNode.parentNode.parentNode.parentNode._video_id);
            event.preventDefault();
        }, false);
    }

    return actions;
}


// aaand making it happen...

// if on a listing page:
var thumbs = document.getElementsByClassName('ux-thumb-wrap');
if (thumbs.length) {
    var buttons = mkButtons();
    document.body.appendChild(buttons);

    // do the stuff
    for (var i=0, j=thumbs.length; i<j; i++) {
        var elem = thumbs[i];

        // let's find the parent link
        var link = null;
        // but remember the thumbnail object for later
        var thumb = elem;

        // stop after let's say... 5 times
        var _iterating = 5;
        while (!link && _iterating-- && elem != document) {
            if (elem.tagName.toLowerCase() == 'a') link = elem;
            else elem = elem.parentNode;
        }

        if (!link) continue; 
        var href = link.getAttribute('href');
        if (!href) continue;
        var video_id = get_video_id(href);
        if (!video_id) continue;

        // set it for later usage
        thumb._video_id = video_id;
       
        // and make the elem display the button on mouseover
        var target = link;
        // TODO: find the real target depending on where you are around youtube 
        
        target._thumb = thumb;

        target.addEventListener('mouseenter', function() {
            this._thumb.appendChild(buttons);
        }, false);
        target.addEventListener('mouseleave', function() {
            // place it back on body, one never knows when its ancestors go away
            document.body.appendChild(buttons);
        }, false);
    }
}

// if on a video page:
var video_id = get_video_id(window.location.href);
video_id = 'test!!11';
if (video_id) {
    var buttons = mkButtons(true);
    
    var container = document.getElementById('watch7-action-buttons');
    if (container) {
        buttons.className = buttons.className + ' inline';
        var elems = buttons.childNodes;
        for (var i=0, j=elems.length; i<j; i++) {
            elems[i].className = elems[i].className.replace('yt-uix-button-default', 'yt-uix-button-text');

        }
        container.appendChild(buttons);
    } else {
        document.body.appendChild(buttons);
        // and style it specially
        //GM_addStyle('#' + play_button_id + '-large { position: fixed; right: 10px; bottom: 10px; }');
    }
}

})();

