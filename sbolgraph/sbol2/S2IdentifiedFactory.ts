
import S2Identified from "./S2Identified";
import { Predicates } from 'bioterms'
import { node } from 'rdfoo'
import SBOL2GraphView from '../SBOL2GraphView'

export default class SXIdentifiedFactory {
    
    static createTopLevel(view:SBOL2GraphView,
                          type:string,
                          uriPrefix:string,
                          id:string|undefined,
                          name:string|undefined,
                          version?:string|undefined):S2Identified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = view.graph.generateURI(uriPrefix + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(id),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version)),
        })

        if(version !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.SBOL2.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new S2Identified(view, uri)

    }

    static createChild(view:SBOL2GraphView,
                    type:string,
                    parent:S2Identified,
                    ownershipPredicate:string,
                    id:string|undefined,
                    name:string|undefined,
                    version?:string|undefined):S2Identified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const uri:string = view.graph.generateURI(
            parent.persistentIdentity + '/' + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(id),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(extractPersistentIdentity(uri, version))
        })

        if(version !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.SBOL2.version]: node.createStringNode(version)
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

        return new S2Identified(view, uri)
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
