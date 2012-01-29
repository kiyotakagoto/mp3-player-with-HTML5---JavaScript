// 文字コードの値によって、変数に格納する関数を変更して対応しようか。
// 毎回スイッチするのは無駄よね。
function readUTF16( utf16, order ){
    // UTF-16(BE)  0xFE 0xFF / UTF-16(LE)  0xFF 0xFE
    var i = 0, l = utf16.length, tmp, str = new Array();
    
    for( ; i < l; ++i ){
        tmp = utf16.charCodeAt( i );
        if( 0x00 === tmp && 0x00 === utf16.charCodeAt( i + 1 ) ){
            break;
        }
        switch( order ){
            case 0xFF: // LE
                str.push( tmp | utf16.charCodeAt( i + 1 ) << 8 );
                break;
            case 0xFE: // BE
            default:
                str.push( tmp << 8 | utf16.charCodeAt( i + 1 ) );
                break;
        }
        ++i;
        /*
        // 2byte
        else if( 0x00 <= tmp && tmp <= 0xD7 ||
            0xE0 <= tmp && tmp <= 0xFF ){
            switch( order ){
                case 0xFE:
                    str.push( tmp << 8 | utf16.charCodeAt( i + 1 ) );
                    break;
                case 0xFF:
                    str.push( tmp | utf16.charCodeAt( i + 1 ) << 8 );
                    break;
                default:
                    break;
            }
            ++i;
        }
        // 3bytes
        else if( 0xD8 <= tmp && tmp <= 0xDF ){
            switch( order ){
                case 0xFE:
                    str.push( tmp << 16 | 
                              utf16.charCodeAt( i + 1 ) << 8 |
                              utf16.charCodeAt( i + 2 ) );
                    break;
                case 0xFF:
                    str.push( tmp | 
                              utf16.charCodeAt( i + 1 ) << 8 |
                              utf16.charCodeAt( i + 2 ) << 16 );
                    break;
                default:
                    break;
            }
            i += 2;
        }
        */
    }
    return str;
}
function readUTF8( utf8 ){
    var i = 0; l = utf8.length, tmp, str = new Array();
    for( ; i < l; ++i ){
        tmp = utf8.charCodeAt( i );
        if( 0x00 === tmp && 0x00 ){
            break;
        }
        // 1byte
        else if( 0x00 <= tmp && tmp <= 0x7F ){
            str.push( tmp );
        }
        // 2bytes
        else if( 0xC2 <= tmp && tmp <= 0xDF ){
            str.push( 
                tmp << 8 | 
                utf8.charCodeAt( i + 1 )
            );
            ++i;
        }
        // 3bytes
        else if( 0xE0 <= tmp && tmp <= 0xEF ){
            str.push(
                tmp << 16 |
                utf8.charCodeAt( i + 1 ) << 8 |
                utf8.charCodeAt( i + 2 )
            );
            i += 2;
        }
        // 4bytes
        else if( 0xF0 <= tmp && tmp <= 0xF7 ){
            str.push(
                tmp << 24 |
                utf8.charCodeAt( i + 1 ) << 16 |
                utf8.charCodeAt( i + 2 ) << 8 |
                utf8.charCodeAt( i + 3 )
            );
            i += 3;
        }
        // 5bytes
        else if( 0xF8 <= tmp && tmp <= 0xFB ){
            str.push(
                tmp << 32 |
                utf8.charCodeAt( i + 1 ) << 24 |
                utf8.charCodeAt( i + 2 ) << 16 |
                utf8.charCodeAt( i + 3 ) << 8  |
                utf8.charCodeAt( i + 4 )
            );
            i += 4;
        }
        // 6bytes
        else if( 0xFC <= tmp && tmp <= FD ){
            str.push(
                tmp << 40 |
                utf8.charCodeAt( i + 1 ) << 32 |
                utf8.charCodeAt( i + 2 ) << 24 |
                utf8.charCodeAt( i + 3 ) << 16 |
                utf8.charCodeAt( i + 4 ) << 8  |
                utf8.charCodeAt( i + 5 ) 
            );
            i += 5;
        }
    }
}
