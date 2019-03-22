
export default class URIUtils {

    static addSuffix(uri:string, suffix:string):string {

        // ends with something that looks like a version?
        if(uri.match(/\/[0-9]+$/)) {

            // insert suffix before version

            let lastSlash = uri.lastIndexOf('/')

            return uri.slice(0, lastSlash) + suffix + uri.slice(lastSlash)

        } else {

            // ends with a fragment?

            let last = uri.lastIndexOf('#')

            if(last !== -1) {

                // insert suffix before fragment

                return uri.slice(0, last) + suffix + uri.slice(last)

            } else {

                // insert suffix at end

                return uri + suffix
            }
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

    static getSuffix(uri:string):string {

        return uri.slice(0, this.getPrefix(uri).length)
    }

}

function popLastToken(uri:string) {

    let last = uri.lastIndexOf('#', uri.length - 2)

    if(last === -1)
        last = uri.lastIndexOf('/', uri.length - 2)

    if(last === -1)
        return uri

    return uri.slice(0, last + 1)
}