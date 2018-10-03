
import S2Identified from "./S2Identified";
import { Predicates } from 'bioterms'
import * as node from '../node'
import SBOL2Graph from '../SBOL2Graph'

export default class SXIdentifiedFactory {
    
    static createTopLevel(graph:SBOL2Graph,
                          type:string,
                          uriPrefix:string,
                          id:string,
                          name:string|undefined,
                          version?:string|undefined):S2Identified {

        id = nameToID(id)

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = graph.generateURI(uriPrefix + id + '$n?$' + versionSuffix)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(id),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version)),
        })

        if(version !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.SBOL2.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new S2Identified(graph, uri)

    }

    static createChild(graph:SBOL2Graph,
                    type:string,
                    parent:S2Identified,
                    ownershipPredicate:string,
                    id:string,
                    name:string|undefined,
                    version?:string|undefined):S2Identified {

        id = nameToID(id)

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = graph.generateURI(
            parent.persistentIdentity + '/' + id + '$n?$' + versionSuffix)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(id),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version))
        })

        if(version !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.SBOL2.version]: node.createStringNode(version)
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

        return new S2Identified(graph, uri)
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
