/*
 * 文字コードはプレイヤ側で対応させる？
 * とすると返り値contentsの中には文字エンコードを示すバイトも含めて返せばいいのか。
 */
function readID3Tag( mp3 ){
    var sizeFlame = new Array(), i = 0, l, size, id3Tag;
    mp3 = new String( mp3 );

    // distinguish version
    // v2
    if( mp3.charCodeAt( 0 ) === 0x49 &&
        mp3.charCodeAt( 1 ) === 0x44 &&
        mp3.charCodeAt( 2 ) === 0x33 ){
        // get bytes representing tag size.
        for (; i < 4; ++i) {
            sizeFlame[i] = mp3.charCodeAt( 6 + i );
        }
        // calculate tag syze.
        for( i = 0; i < 3; ++i ){
            sizeFlame[ i + 1 ] = sizeFlame[i] << 7 | sizeFlame[ i + 1 ];
        }
        size = sizeFlame[ 3 ];
        id3Tag = new String( mp3 ).substr( 10, size );

        return readID3v2Tag( id3Tag, size, mp3.charCodeAt( 3 ) );
    }
    else{ // v1
        id3Tag = mp3.substr( mp3.length - 128, 128 );
        return readID3v1Tag( id3Tag );
    }
}
//===============================================
// ID3v1
//===============================================
/**
 * text encodingに関するバイトが用意されてない→自前で文字コード判定する必要あり？めんど・・・
 * @param {Object} tag
 */
function readID3v1Tag( tag ){
    var contents = new Array();
    
    contents["Title"]   = tag.substr( 3, 30 );
    contents["Artist"]  = tag.substr( 33, 30 );
    contents["Album"]   = tag.substr( 63, 30 );
    contents["Year"]    = tag.substr( 93, 4 );
    contents["Comment"] = tag.substr( 97, 28 );
    
    return contents;
}
//===============================================
// ID3v2
//===============================================
function readID3v2Tag( tag, tagSize, v ){
    var fName, p = 0, fSize, fhl, fnl, fsb,
        tag = new String( tag ), contents;

    switch( v ){
        case 2:
            fhl = 6;  fnl = 3; fsb = 3;
            contents = readv2_2_x( tag, tagSize, fhl, fnl, fsb );
            break;
        case 3:
            fhl = 10; fnl = 4; fsb = 4;
            contents = readv2_3_x( tag, tagSize, fhl, fnl, fsb );
            break;
        case 4:
            fhl = 10; fnl = 4; fsb = 4;
            contents = readv2_4_x( tag, tagSize, fhl, fnl, fsb );
            break;
        default:
            break;
    }
    return contents;
}
// 戻り値構造： hash = ( title : data, artist : data, ..., track : data )
function readv2_2_x( tag, tagSize, fhl, fnl, fsb ){
    var  p = 0, fName, fSize, contents = new Array(), data,
         debug = document.getElementById( "debug" );

    while ( p + fhl < tagSize ) {
        fName = tag.substr( p, fnl );
        if ( "\0\0\0" === fName || "\0\0\0\0" === fName ) {
            break;
        }
        fSize = getFlameSize( tag, p, fsb );
        
        data = readField(tag.substr(p + fhl, fSize), fSize);
        //data = utf.packUTF8(utf.toUTF8(data));
        switch (fName) {
            case 'TT2': // Title/Songname/Content description
                contents["Title"] = data;
                break;
            case 'TAL': // Album/Movie/Show title
                contents["Album"] = data;
                break;
            case 'TP1': // Lead artist(s)/Lead performer(s)/Soloist(s)/Performing group
                contents["Artist"] = data;
                break;
            case 'TYE': // Year
                contents["Year"] = data;
                break;
            case 'TRK': // Track number/Position in set
                contents["Track"] = data;
                break;
            case 'TCO': // Content type
                contents["Genre"] = data;
                break;
            case 'BUF': // Recommended buffer size
            case 'CNT': // Play counter
            case 'COM': // Comments
            case 'CRA': // Audio encryption
            case 'CRM': // Encrypted meta frame
            case 'ETC': // Event timing codes
            case 'EQU': // Equalization
            case 'GEO': // General encapsulated object
            case 'IPL': // Involved people list
            case 'LNK': // Linked information
            case 'MCI': // Music CD Identifier
            case 'MLL': // MPEG location lookup table
            case 'PIC': // Attached picture
            case 'POP': // Popularimeter
            case 'REV': // Reverb
            case 'RVA': // Relative volume adjustment
            case 'SLT': // Synchronized lyric/text
            case 'STC': // Synced tempo codes
            case 'TBP': // BPM (Beats Per Minute)
            case 'TCM': // Composer
            case 'TCR': // Copyright message
            case 'TDA': // Date
            case 'TDY': // Playlist delay
            case 'TEN': // Encoded by
            case 'TFT': // File type
            case 'TIM': // Time
            case 'TKE': // Initial key
            case 'TLA': // Language(s)
            case 'TLE': // Length
            case 'TMT': // Media type
            case 'TOA': // Original artist(s)/performer(s)
            case 'TOF': // Original filename
            case 'TOL': // Original Lyricist(s)/text writer(s)
            case 'TOR': // Original release year
            case 'TOT': // Original album/Movie/Show title
            case 'TP2': // Band/Orchestra/Accompaniment
            case 'TP3': // Conductor/Performer refinement
            case 'TP4': // Interpreted, remixed, or otherwise modified by
            case 'TPA': // Part of a set
            case 'TPB': // Publisher
            case 'TRC': // ISRC (International Standard Recording Code)
            case 'TRD': // Recording dates
            case 'TSI': // Size
            case 'TSS': // Software/hardware and settings used for encoding
            case 'TT1': // Content group description
            case 'TT3': // Subtitle/Description refinement
            case 'TXT': // Lyricist/text writer
            case 'TXX': // User defined text information frame
            case 'UFI': // Unique file identifier
            case 'ULT': // Unsychronized lyric/text transcription
            case 'WAF': // Official audio file webpage
            case 'WAR': // Official artist/performer webpage
            case 'WAS': // Official audio source webpage
            case 'WCM': // Commercial information
            case 'WCP': // Copyright/Legal information
            case 'WPB': // Publishers official webpage
            case 'WXX': // User defined URL link frame
                break;
            default:
                break;
        }
        p += fSize + fhl;
    }
    return contents;
}
function readv2_3_x( tag, tagSize, fhl, fnl, fsb ){
    var  p = 0, fName, fSize, contents = new Array(), data,
         debug = document.getElementById( "debug" );

    while ( p + fhl < tagSize ) {
        fName = tag.substr( p, fnl );
        if ( "\0\0\0" === fName || "\0\0\0\0" === fName ) {
            break;
        }
        fSize = getFlameSize( tag, p, fsb );

        data = readField(tag.substr(p + fhl, fSize), fSize);
        //data = utf.packUTF8(utf.toUTF8(data));
        switch (fName) {
            case 'TIT2': // タイトル/曲名/内容の説明
                contents["Title"] = data;
                break;
            case 'TALB': // アルバム/映画/ショーのタイトル
                contents["Album"] = data;
                break;
            case 'TPE1': // 主な演奏者/ソリスト
                contents["Artist"] = data;
                break;
            case 'TYER': // 年
                contents["Year"] = data;
                break;
            case 'TRCK': // トラックの番号/セット中の位置
                contents["Track"] = data;
                break;
            case 'TCON': // 内容のタイプ
                contents["Genre"] = data;
                break;
            case 'ANEC': // オーディオの暗号化
            case 'APIC': // 付属する画像
            case 'COMM': // コメント
            case 'COMR': // コマーシャルフレーム
            case 'ENCR': // 暗号化の手法の登録
            case 'EQUA': // 均一化
            case 'ETCO': // イベントタイムコード
            case 'GEOB': // パッケージ化された一般的なオブジェクト
            case 'GRID': // グループ識別子の登録
            case 'IPLS': // 協力者
            case 'LINK': // リンク情報
            case 'MCDI': // 音楽ＣＤ識別子
            case 'MLLT': // MPEGロケーションルックアップテーブル
            case 'OWNE': // 所有権フレーム
            case 'PRIV': // プライベートフレームプライベートフレーム
            case 'PCNT': // 演奏回数
            case 'POPM': // 人気メーター
            case 'POSS': // 同期位置フレーム
            case 'RBUF': // おすすめバッファサイズ
            case 'RVAD': // 相対的ボリューム調整
            case 'RVRB': // リバーブ
            case 'SYLT': // 同期
            case 'SYTC': // 同期
            case 'TBPM': // BPM
            case 'TCOM': // 作曲者
            case 'TCOP': // 著作権情報
            case 'TDAT': // 日付
            case 'TDLY': // プレイリスト遅延時間
            case 'TENC': // エンコードした人
            case 'TEXT': // 作詞家/文書作成者
            case 'TFLT': // ファイルタイプ
            case 'TIME': // 時間
            case 'TIT1': // 内容の属するグループの説明
            case 'TIT3': // サブタイトル/説明の追加情報
            case 'TKEY': // 初めの調
            case 'TLAN': // 言語
            case 'TLEN': // 長さ
            case 'TMED': // メディアタイプ
            case 'TOAL': // オリジナルのアルバム/映画/ショーのタイトル
            case 'TOFN': // オリジナルファイル名
            case 'TOLY': // オリジナルの作詞家/文書作成者
            case 'TOPE': // オリジナルアーティスト/演奏者
            case 'TORY': // オリジナルのリリース年
            case 'TOWN': // ファイルの所有者/ライセンシー
            case 'TPE2': // バンド/オーケストラ/伴奏
            case 'TPE3': // 指揮者/演奏者詳細情報
            case 'TPE4': // 翻訳者,
            case 'TPOS': // セット中の位置
            case 'TPUB': // 出版社
            case 'TRDA': // 録音日付
            case 'TRSN': // インターネットラジオ局の名前
            case 'TRSO': // インターネットラジオ局の所有者
            case 'TSIZ': // サイズ
            case 'TSRC': // ISRC
            case 'TSSE': // エンコードに使用したソフトウエア/ハードウエアとセッティング
            case 'TXXX': // ユーザー定義文字情報フレーム
            case 'UFID': // 一意的なファイル識別子
            case 'USER': // 使用条件
            case 'USLT': // 非同期
            case 'WCOM': // 商業上の情報
            case 'WCOP': // 著作権/法的情報
            case 'WOAF': // オーディオファイルの公式Webページ
            case 'WOAR': // アーティスト/演奏者の公式Webページ:
            case 'WOAS': // 音源の公式Webページ
            case 'WORS': // インターネットラジオ局の公式ホームページ
            case 'WPAY': // 支払い
            case 'WPUB': // 出版社の公式Webページ
            case 'WXXX': // ユーザー定義URLリンクフレーム
                break;
            default:
                break;
        }
        p += fSize + fhl;
    }
    return contents;
}
// 2.4はいろんな文字エンコーディングに対応してる
function readv2_4_x(  tag, fName, fSize, fhl, p  ){
    var  p = 0, fName, fSize, contents = new Array(), data,
         debug = document.getElementById( "debug" );

    while ( p + fhl < tagSize ) {
        fName = tag.substr( p, fnl );
        if ( "\0\0\0" === fName || "\0\0\0\0" === fName ) {
            break;
        }
        fSize = getFlameSize( tag, p, fsb );

        data = readField(tag.substr(p + fhl, fSize), fSize);
        switch( fName ){
            case 'TIT2': // タイトル/曲名/内容の説明
                contents["Title"] = data;
                break;
            case 'TALB': // アルバム/映画/ショーのタイトル
                contents["Album"] = data;
                break;
            case 'TPE1': // 主な演奏者/ソリスト
                contents["Artist"] = data;
                break;
            case 'TRCK': // トラックの番号/セット中の位置
                contents["Track"] = data;
                break;
            case 'TCON': // 内容のタイプ
                contents["Genre"] = data;
                break;
            case 'AENC': // Audio encryption
            case 'APIC': // Attached picture
            case 'ASPI': // Audio seek point index
            case 'COMM': // Comments
            case 'COMR': // Commercial frame
            case 'ENCR': // Encryption method registration
            case 'EQU2': // Equalisation (2)
            case 'ETCO': // Event timing codes
            case 'GEOB': // General encapsulated object
            case 'GRID': // Group identification registration
            case 'LINK': // Linked information
            case 'MCDI': // Music CD identifier
            case 'MLLT': // MPEG location lookup table
            case 'OWNE': // Ownership frame
            case 'PRIV': // Private frame
            case 'PCNT': // Play counter
            case 'POPM': // Popularimeter
            case 'POSS': // Position synchronisation frame
            case 'RBUF': // Recommended buffer size
            case 'RVA2': // Relative volume adjustment (2)
            case 'RVRB': // Reverb
            case 'SEEK': // Seek frame
            case 'SIGN': // Signature frame
            case 'SYLT': // Synchronised lyric/text
            case 'SYTC': // Synchronised tempo codes
            case 'TBPM': // BPM (beats per minute)
            case 'TCOM': // Composer
            case 'TCOP': // Copyright message
            case 'TDEN': // Encoding time
            case 'TDLY': // Playlist delay
            case 'TDOR': // Original release time
            case 'TDRC': // Recording time
            case 'TDRL': // Release time
            case 'TDTG': // Tagging time
            case 'TENC': // Encoded by
            case 'TEXT': // Lyricist/Text writer
            case 'TFLT': // File type
            case 'TIPL': // Involved people list
            case 'TIT1': // Content group description
            case 'TIT3': // Subtitle/Description refinement
            case 'TKEY': // Initial key
            case 'TLAN': // Language(s)
            case 'TLEN': // Length
            case 'TMCL': // Musician credits list
            case 'TMED': // Media type
            case 'TMOO': // Mood
            case 'TOAL': // Original album/movie/show title
            case 'TOFN': // Original filename
            case 'TOLY': // Original lyricist(s)/text writer(s)
            case 'TOPE': // Original artist(s)/performer(s)
            case 'TOWN': // File owner/licensee
            case 'TPE2': // Band/orchestra/accompaniment
            case 'TPE3': // Conductor/performer refinement
            case 'TPE4': // Interpreted, remixed, or otherwise modified by
            case 'TPOS': // Part of a set
            case 'TPRO': // Produced notice
            case 'TPUB': // Publisher
            case 'TRSN': // Internet radio station name
            case 'TRSO': // Internet radio station owner
            case 'TSOA': // Album sort order
            case 'TSOP': // Performer sort order
            case 'TSOT': // Title sort order
            case 'TSRC': // ISRC (international standard recording code)
            case 'TSSE': // Software/Hardware and settings used for encoding
            case 'TSST': // Set subtitle
            case 'TXXX': // User defined text information frame
            case 'UFID': // Unique file identifier
            case 'USER': // Terms of use
            case 'USLT': // Unsynchronised lyric/text transcription
            case 'WCOM': // Commercial information
            case 'WCOP': // Copyright/Legal information
            case 'WOAF': // Official audio file webpage
            case 'WOAR': // Official artist/performer webpage
            case 'WOAS': // Official audio source webpage
            case 'WORS': // Official Internet radio station homepage
            case 'WPAY': // Payment
            case 'WPUB': // Publishers official webpage
            case 'WXXX': // User defined URL link frame
                break;
            default:
                break;
        }
        p += fSize + fhl;
    }
    return contents;
}
function readField( flame, size ){
    return new String( flame.substr( 0, size ) );
}
function getFlameSize( flame, p, hl ){
    var i = p, size = 0, offset = ( hl - 1 ) * 8,
        l = p + hl;

    for( ; i < l; ++i ){
        size += flame.charCodeAt( i + hl ) << ( offset - ( i - p )*8 );
    }
    return size;
}
