/**
 * todo:音声ファイルかわってもstreamかわらない
 * todo:setintervalとclearintrervalでstreamを読める
 * 
 * ユーザ定義文字情報フレーム、URLリンクフレーム、ユーザー定義URLリンクフレーム、
 * 音楽ＣＤ識別子、イベントタイムコード、MPEG ロケーションルックアップテーブル、同期テンポコード、
 * 歌詞USLT、同期をとった歌詞SYLT、などなど対応してない部分多い。
 * 
 * idea:
 * readAsURIにして、適当な長さに区切ってdecodeしてタグ読む。だめか？
 */
var songList = playList = new Array(),
    player = createPlayer(),
    httpObj = new XMLHttpRequest(),
    refreshUrl = "";

// ファイルが選択されたら読み込む
document.getElementById("selectingsongs").addEventListener("change", function(){
  var files = document.getElementById("selectingsongs").files,
      plDom = document.getElementById( "playlist" ),
      i = 0, l = files.length;
  for( ; i < l; ++i ){
    addPlayList( i, files[i].name, plDom );
    read( files[i], i );
  }
}, true);
// 再生ファイル選択のさいはplaylistを初期化する
YAHOO.util.Event.on( "selectingsongs", "click", function(){
    document.getElementById( "playlist" ).innerHTML = "";
    document.getElementById( "nowplaying" ).innerHTML = "";
    player.stop();
    player.setIndex( 0 );
    songList = [];
    playList = [];
  }
);
// 再生リストに追加
YAHOO.util.Event.on( "addingsongs", "change", function(){
    var files = document.getElementById("addingsongs").files,
        plDom = document.getElementById( "playlist" );
        slLength = songList.length, l = files.length, i = 0;
    for( ; i < l; ++i ){
        addPlayList( i + slLength, files[i].name, plDom );
        read( files[i], i + slLength );
    }
  }
);
//早送り
YAHOO.util.Event.on( "fast-forward", "mousedown", function(){
    player.fastForward();
  }
);
//巻き戻し
YAHOO.util.Event.on( "rewind", "mousedown", function(){
    player.rewind();
  }
);
//次の曲
YAHOO.util.Event.on( "next", "click", function(){
    player.playNext();
  }
);
//前の曲
YAHOO.util.Event.on( "previous", "click", function(){
    player.playPrev();
  }
);
/**
 * プレイリストへ追加
 * @param songNum
 * @param songName
 * @param plDom
 * @return
 */
function addPlayList( songNum, songName, plDom ){
    var song    = document.createElement( "li" ),
        status  = document.createElement( "span" ),
        dbutton = document.createElement( "input" );

    dbutton.type = "button"; dbutton.value = "×";
    YAHOO.util.Event.on( dbutton, "click", deleteItem );

    song.value = songNum;
    YAHOO.util.Event.on( song, "dblclick", playSelectedSong );
    
    status.id = songNum;
    status.innerHTML = " -- loading...<img src='./img/ajax-loader.gif' />";
    
    var sNameTNode = document.createTextNode( songName );

    song.appendChild( dbutton );
    song.appendChild( sNameTNode );
    song.appendChild( status );
    plDom.appendChild( song );
}
/**
 * プレイリストから削除
 * @param e
 * @return
 */
function deleteItem( e ){
  var song    = e.srcElement.parentElement,
      value = song.value,
      debug = document.getElementById( "debug" ),
      plist = song.parentElement;
  plist.removeChild( song );

  delete songList[ value ]; // 配列の要素を詰めない
  var i = 0, plAlias = playList, l = plAlias.length, plv;
  for( ; i < l; ++i ){
      if( plAlias[i] === value ){
          plAlias.splice( i, 1 ); // 配列の要素を詰める
      }
  }
}
function initAudio( audio, i ){
    var time = document.getElementById( "time" );
    var flag = true;
    audio.addEventListener( "timeupdate", function(){
      var current_time = audio.currentTime,
          m = ( '0' + Math.floor( current_time / 60 ) ) .slice( -2 ),
          s = ( '0' + Math.floor( current_time % 60 ) ) .slice( -2 );
      time.innerText = m + ":" + s;
      if( flag && 0 == s % 5 ){
          readStream( songList[ i ]["id3"] );
          flag = false;
      }else if( 0 == ( ++s ) % 5 ){
          flag = true;
      }
    },false);
    audio.addEventListener( "ended", function(){
      player.setIndex( player.getIndex() + 1 );
      play();
    }, false);
    audio.addEventListener( "play", function(){
      var duration = audio.duration,
          m = ( '0' + Math.floor( duration / 60 ) ) .slice( -2 ),
          s = ( '0' + Math.floor( duration % 60 ) ) .slice( -2 );
      document.getElementById( "duration" ).innerHTML = m + ":" + s;
      //echoNestAjax( songList[ i ]["id3"] );
      searchBingImages( songList[ i ]["id3"] );
      //refreshUrl = '', document.getElementById( "stream_field" ).innerHTML = "";
      //streamTimer();
    }, false);
    audio.addEventListener( "canplay", function(){
      document.getElementById( i ).innerHTML = " -- canPlay<img src='./img/ok.gif' />";
      var date = new Date();
      //document.getElementById( "debug" ).innerHTML += i + ":" + date.getTime() + "<br/>";
    }, false );
    audio.addEventListener( "error", function(){
        alert( "エラーが発生しました：" + audio.error.code );
    }, false);
    return audio;
}
//ファイルを読み込み、配列に保存
// todo:binaryでaudio読み込み⇒できないっぽい？
function read( file, i ){
  var reader = new FileReader,
      infoField = document.getElementById( "info_field" ),
      debug = document.getElementById( "debug" ),
      buf, tmp, sName, singer, aName, plAlias = playList;
  reader.onload = function( e ){
    var audio = initAudio( new Audio( "" ), i ), contents;
    contents = readID3Tag( reader.result );
    contents = encoding( contents );
    showID3Contents( contents );
    var b4 = base64["encode"]( reader.result, false );
    b4 = "data:audio/mp3;base64," + b4;
    audio.src = b4;
    songList[ i ] = { 
        "audio" : audio,
        "name"  : file.name,
        "id3"   : contents
    };
    plAlias[i] = i;
  };
  //reader.readAsDataURL( file );
  reader.readAsBinaryString( file );
}
function encoding( contents ){
    var prop, cCode, tmp;
    for( prop in contents ){
        cCode = contents[prop].charCodeAt( 0 );
        tmp = contents[prop];
        switch( cCode ){
            case 0: // ISO-8859-1
                tmp = sjisToUtf16( tmp.substr( 1, tmp.length - 1 ) );
                contents[prop] = utf.packUTF8( utf.toUTF8( tmp ) );
                break;
            case 1: // UTF16
            case 2:
                tmp = readUTF16( tmp.substr( 3, tmp.length - 3 ), tmp.charCodeAt( 1 ) );
                contents[prop] = utf.packUTF8( utf.toUTF8( tmp ) );
                break;
            case 3: // UTF8
                tmp = readUTF8( tmp.substr( 1, tmp.length - 1 ) );
                contents[prop] = utf.packUTF8( utf.toUTF8( tmp ) );
                break;
            default:
                tmp = sjisToUtf16( tmp.substr( 0, tmp.length ) );
                contents[prop] = utf.packUTF8( utf.toUTF8( tmp ) );
                break;
        }
    }
    return contents;
}
function showID3Contents( contents ){
    var ifield = document.getElementById( "info_field" ),
        prop;
    
    ifield.innerHTML = "";
    for( prop in contents ){
        ifield.innerHTML += prop + " / " + contents[prop] + "<br/>";
    }
}
function searchBingImages( id3 ){
    var BASE = "http://api.search.live.net/json.aspx?JsonType=callback&JsonCallback=displayBingImages",
        appId = "7B7C9F46367E2C1047954EFCBD21568D4C3AE1AE",
        query = encodeURI( id3["Title"] ) + " " + encodeURI( id3["Artist"] ),
        sources = "image",
        uri;
    uri = BASE + "&Appid=" + appId + "&query=" + query + "&sources=" + sources;

//    httpObj.onload = displayBingImages;
//    httpObj.open( "GET", uri, true );
//    httpObj.send( null );
    script = document.createElement( "script" );
    script.charset = "utf-8";
    script.src = uri;
    document.lastChild.appendChild( script );

}
function displayBingImages( res ){
//    var data = eval( "(" + responseText.srcElement.response + ")" ),
    var images = res["SearchResponse"]["Image"]["Results"],
        l = images.length,
        i = 0,
        imgField = document.getElementById( "img_field" );
    imgField.innerHTML = "";
    for( ; i < l; ++i ){
        imgField.innerHTML += '<img src="' + images[i]["Thumbnail"]["Url"] + '" width="50" height="50" /> ';
    }
}

//http://api.search.live.net/json.aspx?Appid=%3CAppID%3E&query=sushi&sources=web
// echonestAPIをAjaxでたたく
function echoNestAjax( id3 ){
//    var debug = document.getElementById( "debug" );//,
    var title, artist, album;
//        uri = "http://developer.echonest.com/api/v4/artist/images?" + 
//              "api_key=0VXD6VFYA9L298XNE" + 
//              "&name=" + encodeURI( artist ) + 
//              "&format=json" + 
//              "&results=5" + 
//              "&start=0";
    title    = encodeURI( id3["Title"] );
    artist   = encodeURI( id3["Artist"] );
    //composer = encodeURI( id3["composer"] );
    album    = encodeURI( id3["Album"] );

//    debug.innerHTML += title + "/" +
//                       artist + "/" +
//                       composer + "/" +
//                       album + "<br/>";
    var uri = "http://developer.echonest.com/api/v4/artist/images?" + 
    "api_key=0VXD6VFYA9L298XNE" + 
    "&name=" + artist + 
    "&format=json" + 
    "&results=5" + 
    "&start=0";

    httpObj.onload = displayInfo;
    httpObj.open( "GET", uri, true );
    httpObj.send( null );
//    getURL( uri, displayInfo );
}
function displayInfo( responseText ){
    var data = eval( "(" + responseText.srcElement.response + ")" ),
        l = data["response"]["images"].length,
        images = data["response"]["images"],
        i = 0,
        echonestField = document.getElementById( "echonest_field" );
        echonestField.innerHTML = "";
    for( ; i < l; ++i ){
        echonestField.innerHTML += '<img src="' + images[i]["url"] + '" width="50" height="50" /> ';
    }
}
// プレイヤーを作るクロージャ
function createPlayer(){
  var index = 0, pause = false, curAudio, curAudioName, volume = 0.5,
      debug = document.getElementById( "debug" ),
      nplaying = document.getElementById( "nowplaying" );
  
  this.play = function(){
    if( pause ){
      pause = false;
    }else if( index < 0 ){ // playPrev
        index = playList.length - 1;
    }else if( !songList[ playList[index] ] ){
        index = 0;
    }

    curAudio = songList[ playList[index] ]["audio"];
    curAudioName = songList[ playList[index] ]["name"];
    nplaying.innerHTML = "now playing : " + curAudioName;
    //debug.innerHTML = "scheme:" + curAudio.src;
    
    curAudio.volume = volume;
    curAudio.play();
  };
  this.playNext = function(){
      this.stop();
      pause = false;
      index += 1;
      this.play();
  };
  this.playPrev = function(){
      this.stop();
      pause = false;
      index += -1;
      this.play();
  };
  this.pause = function(){
    curAudio.pause();
    pause = true;
  };
  this.stop = function(){
    if( curAudio ){
        curAudio.pause();
        curAudio.currentTime = 0;
    }
  };
  this.volumeUp = function(){
    if( curAudio && curAudio.volume < 0.9 ){
      curAudio.volume = volume += 0.1;
    }
  };
  this.volumeDown = function(){
    if( curAudio && curAudio.volume > 0.1 ){
      curAudio.volume = volume -= 0.1;
    }
  };
  this.fastForward = function(){
      curAudio.currentTime += 2.0;
  };
  this.rewind = function(){
      curAudio.currentTime -= 2.0;
  };
  this.setIndex = function( newIndex ){
    index = newIndex;
    if( index < 0 ){
      index = songList.length - 1;
    }
  };
  this.getIndex = function(){
    return index;
  };
  this.setPause = function( pause ){
      this.pause = pause;
  };
  this.getPause = function(){
      return this.pause;
  };
  return this;
}

function play(){
  player.play();
}
function pause(){
  player.pause();
}
function stop(){
  player.stop();
}
function volumeUp(){
  player.volumeUp();
}
function volumeDown(){
  player.volumeDown();
}
/**
 * プレイリスト中の選択された音楽を再生
 * @param {Object} event
 */
function playSelectedSong( e ){
  var songNum;
  if( e.srcElement ){
    songNum = e.srcElement.value;
  }else{
    songNum = e.target.value;
  }

  if( songList[ songNum] ){
    stop();
    var i = 0, plAlias = playList, l = plAlias.length;
    for( ; i < l; ++i ){
        if( plAlias[i] === songNum ){
            player.setIndex( i );
            break;
        }
    }
    play();
  }
}
