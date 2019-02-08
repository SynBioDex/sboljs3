
export default class URIUtils {

    static addSuffix(uri:string, suffix:string):string {

        // ends with something that looks like a version?
        if(uri.match(/\/[0-9]+$/)) {

            // insert suffix before version

            let lastSlash = uri.lastIndexOf('/')

            return uri.slice(0, lastSlash) + suffix + uri.slice(lastSlash)

        } else {

            // insert suffix at the end

            return uri + suffix
        }
    }

    static getPrefix(uri:string):string {

        // ends with something that looks like a version?
        if(uri.match(/\/[0-9]+$/)) {

            return popLastToken(popLastToken(uri))

        } else {

            return popLastToken(uri)
        }
    }

}

function popLastToken(uri:string) {

    let last = uri.lastIndexOf('#')

    if(last === -1)
        last = uri.lastIndexOf('/')

    if(last === -1)
        return uri

    return uri.slice(0, last)
}