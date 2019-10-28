
import SXIdentified from "./SXIdentified";
import { Predicates } from 'bioterms'
import { node } from 'rdfoo'
import SBOLXGraphView from '../SBOLXGraphView'

export default class SXIdentifiedFactory {
    
    static createTopLevel(view:SBOLXGraphView,
                          type:string,
                          uriPrefix:string,
                          id:string|undefined,
                          name:string|undefined,
                          version?:string|undefined):SXIdentified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = view.graph.generateURI(uriPrefix + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOLX.id]: node.createStringNode(extractID(uri, version)),
            [Predicates.SBOLX.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version)),
        })

        if(version !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.SBOLX.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new SXIdentified(view, uri)

    }
    
    static createChild(view:SBOLXGraphView,
                    type:string,
                    parent:SXIdentified,
                    ownershipPredicate:string,
                    id:string|undefined,
                    name:string|undefined,
                    version?:string|undefined):SXIdentified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = view.graph.generateURI(
            parent.persistentIdentity + '/' + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOLX.id]: node.createStringNode(extractID(uri, version)),
            [Predicates.SBOLX.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version))
        })

        if(version !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.SBOLX.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        view.graph.insertProperties(parent.uri, {
            [ownershipPredicate]: node.createUriNode(uri)
        })

        return new SXIdentified(view, uri)
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



