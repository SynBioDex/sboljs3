
import request = require('request')
import SBOL2Graph from "./SBOL2Graph";

export class SearchQuery {

    criteria:any[]

    constructor() {
        this.criteria = []
    }


    add(key:string, value:string) {

        this.criteria.push({ key: key, value: value })

    }

    addObjectType(name:string) {

        this.add('objectType', name)

    }

    addRole(uri:string) {

        this.add('role', '<' + uri + '>')

    }


}

export class SearchResult {

    description:string
    displayId:string
    name:string
    uri:string
    version:string

}

export default class Repository {

    url:string

    constructor(url:string) {

        this.url = url

    }

    searchMetadata(query:SearchQuery):Promise<Array<SearchResult>> {

        var params = ''

        var isFirst = true

        query.criteria.forEach((c:any) => {

            //if(isFirst)
                //isFirst = false
            //else

            params += c.key
            params += '='
            params += c.value
            params += '&'
        
        })

        return new Promise((resolve, reject) => {

            request.get({
                url: this.url + '/remoteSearch/' + encodeURIComponent(params)
            }, (err, res, body) => {

                if(err) {
                    reject(err)
                    return
                }

                if(res.statusCode && res.statusCode >= 300) {
                    reject(new Error('HTTP ' + res.statusCode))
                    return
                }

                try {
                    var results:SearchResult[] = JSON.parse(body)
                } catch(e) {
                    reject(e)
                    return
                }

                resolve(results)
            })

        })
    }

}
