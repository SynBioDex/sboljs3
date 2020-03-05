
import S3Identified from "./S3Identified";
import { Predicates } from 'bioterms'
import { node } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView'

export default class S3IdentifiedFactory {
    
    static createTopLevel(view:SBOL3GraphView,
                          type:string,
                          uriPrefix:string,
                          id:string|undefined,
                          name:string|undefined,
                          version?:string|undefined):S3Identified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = view.graph.generateURI(uriPrefix + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.id]: node.createStringNode(extractID(uri, version)),
            [Predicates.SBOL3.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version)),
        })

        if(version !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.SBOL3.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new S3Identified(view, uri)

    }
    
    static createChild(view:SBOL3GraphView,
                    type:string,
                    parent:S3Identified,
                    ownershipPredicate:string,
                    id:string|undefined,
                    name:string|undefined,
                    version?:string|undefined):S3Identified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = view.graph.generateURI(
            parent.persistentIdentity + '/' + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.id]: node.createStringNode(extractID(uri, version)),
            [Predicates.SBOL3.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version))
        })

        if(version !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.SBOL3.version]: node.createStringNode(version)
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

        return new S3Identified(view, uri)
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



