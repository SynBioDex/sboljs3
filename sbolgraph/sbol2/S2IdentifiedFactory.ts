
import S2Identified from "./S2Identified";
import { Predicates } from 'bioterms'
import { node } from 'rdfoo'
import SBOL2GraphView from '../SBOL2GraphView'
import { Node } from 'rdfoo'

export default class S3IdentifiedFactory {
    
    static createTopLevel(view:SBOL2GraphView,
                          type:string,
                          uriPrefix:string,
                          id:string|undefined,
                          name:string|undefined,
                          version?:string|undefined):S2Identified {

        id = id ? nameToID(id) : 'anon'

        let versionSuffix = version !== undefined ? '/' + version : ''

        const subject:string = view.graph.generateURI(uriPrefix + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(node.createUriNode(subject), {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(id),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(extractPersistentIdentity(subject, version)),
        })

        if(version !== undefined) {
            view.graph.insertProperties(node.createUriNode(subject), {
                [Predicates.SBOL2.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            view.graph.insertProperties(node.createUriNode(subject), {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new S2Identified(view, node.createUriNode(subject))

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

	let parentPersistentIdentity = parent.persistentIdentity

        const subject:string = view.graph.generateURI(
            parentPersistentIdentity + '/' + id + '$n?$' + versionSuffix)

        view.graph.insertProperties(node.createUriNode(subject), {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(id),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(extractPersistentIdentity(subject, version))
        })

        if(version !== undefined) {
            view.graph.insertProperties(node.createUriNode(subject), {
                [Predicates.SBOL2.version]: node.createStringNode(version)
            })
        }

        if(name !== undefined) {
            view.graph.insertProperties(node.createUriNode(subject), {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        view.graph.insertProperties(parent.subject, {
            [ownershipPredicate]: node.createUriNode(subject)
        })

        return new S2Identified(view, node.createUriNode(subject))
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
