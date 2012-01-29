/**
 * twitter streaming apiを読む
 * @return
 */
function readStream( id3 ){
    var uri = "http://search.twitter.com/search.json";
    if( '' !== refreshUrl){
        uri += refreshUrl;
    }else{
//        uri += "?q=" + encodeURI( id3["Artist"] ) + "," +
//                       encodeURI( id3["Title"] );
        uri += "?q=";
        uri += encodeURI( id3["Artist"] ) + ",";
        uri += encodeURI( id3["Title"] );
    }
    uri += "&rpp=10" + 
           "&callback=displayStream" + 
           "&result_type=recent";
    // ready for jsonp
    script = document.createElement( "script" );
    script.charset = "utf-8";
    script.src = uri;
    document.lastChild.appendChild( script );
}
/**
 * stream表示
 * @return
 */
function displayStream( json ){
    var sField, results = json["results"], i = results.length - 1,
        result, profImage, text, stream, fChild, abox, tbox, br, sname, link;
    refreshUrl = json["refresh_url"];
    // = document.getElementById( "stream_field" )
    if( 1 === json["page"] ){
        sField = document.getElementById( "stream_field" );
    }else{
        sField = document.getElementById( "stream_page" );
    }
    for( ; i > -1; --i ){
        // create dom
        result = results[i];
        stream = document.createElement( "div" );
        stream.id = "stream_wrapper";

        // account box
        abox = document.createElement( "div" );
        abox.id = "account";
        profImage = document.createElement( "img" );
        profImage.src = result["profile_image_url"];
        br = document.createElement( "br" );
        link = document.createElement( "a" );
        link.href = "http://twitter.com/#!/" + result["from_user"];
        sname = document.createTextNode( result["from_user"] );
        link.appendChild( sname );
        abox.appendChild( profImage );
        abox.appendChild( br );
        abox.appendChild( link );
        
        // text box
        tbox = document.createElement( "div" );
        tbox.id = "text";
        text = document.createTextNode( result["text"] );
        tbox.appendChild( text );
//        text = document.createTextNode( result["from_user"] + " : " +
//                                        result["text"] + " / " + 
//                                        result["created_at"] );
        createStreamNavi( result["next_page"] );
        // insert
//        stream.appendChild( profImage );
//        stream.appendChild( text );
        stream.appendChild( abox );
        stream.appendChild( tbox );
        fChild = sField.firstChild;
        sField.insertBefore( stream, fChild );
    }
}
// stream：最新ツイート垂れ流しviewとページ送りviewを分けるか。z-indexで切り替え。
// なぜかonclickが直書きできない
function createStreamNavi( next_page ){
    var naviField = document.getElementById( "stream_navi" ),
        naviButton = document.createElement( "input" );
    naviField.innerHTML = '';
    naviButton.type = "submit";
    naviButton.value = "next page";
    naviButton.onclick = "readStreamPage( 'http://search.twitter.com/search.json" + 
                          next_page + 
                          "&callback=displayStream')";
    naviField.appendChild( naviButton );
}
function readStreamPage( uri ){
    // ready for jsonp
    script = document.createElement( "script" );
    script.charset = "utf-8";
    script.src = uri;
    document.lastChild.appendChild( script );
}
