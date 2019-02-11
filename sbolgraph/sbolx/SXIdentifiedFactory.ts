
import SXIdentified from "./SXIdentified";
import { Predicates } from 'bioterms'
import * as node from '../node'
import SBOLXGraph from '../SBOLXGraph'

export default class SXIdentifiedFactory {
    
    static createTopLevel(graph:SBOLXGraph,
                          type:string,
                          uriPrefix:string,
                          id:string|undefined,
                          name:string|undefined,
                          version?:string|undefined):SXIdentified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = graph.generateURI(uriPrefix + id + '$n?$' + versionSuffix)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOLX.id]: node.createStringNode(extractID(uri, version)),
            [Predicates.SBOLX.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version)),
        })

        if(version !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.SBOLX.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new SXIdentified(graph, uri)

    }
    
    static createChild(graph:SBOLXGraph,
                    type:string,
                    parent:SXIdentified,
                    ownershipPredicate:string,
                    id:string|undefined,
                    name:string|undefined,
                    version?:string|undefined):SXIdentified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = graph.generateURI(
            parent.persistentIdentity + '/' + id + '$n?$' + versionSuffix)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOLX.id]: node.createStringNode(extractID(uri, version)),
            [Predicates.SBOLX.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version))
        })

        if(version !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.SBOLX.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        graph.insertProperties(parent.uri, {
            [ownershipPredicate]: node.createUriNode(uri)
        })

        return new SXIdentified(graph, uri)
    }

}

function nameToID(name:string):string {

    // TODO
    return name.replace(/\s/, '_')

}

function extractPersistentIdentity(uri:string, version:string|undefined) {
    if(version !== undefined) {
        return uri.substr(0, uri.length - version.length - 1)
    } else {
        return uri
    }
}

function extractID(uri:string, version:string|undefined) {
    let tokens = uri.split('/')
    if(version !== undefined) {
        return tokens[tokens.length - 2]
    } else {
        return tokens[tokens.length - 1]
    }
}



