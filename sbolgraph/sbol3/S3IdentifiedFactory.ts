
import S3Identified from "./S3Identified";
import { Predicates, Types } from 'bioterms'
import { node } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView'
import URIUtils from "../URIUtils";

export default class S3IdentifiedFactory {
    
    static createTopLevel(view:SBOL3GraphView,
                          type:string,
                          uriPrefix:string,
                          displayId:string|undefined,
                          name:string|undefined):S3Identified {

        displayId = displayId ? nameToID(displayId) : 'anon'

        const subject:Node = view.graph.generateURI(uriPrefix + displayId + '$n?$')

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.displayId]: node.createStringNode(displayId)
        })

        if(name !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new S3Identified(view, subject)

    }
    
    static createChild(view:SBOL3GraphView,
                    type:string,
                    parent:S3Identified,
                    ownershipPredicate:string,
                    displayId:string|undefined,
                    name:string|undefined):S3Identified {

        displayId = displayId ? nameToID(displayId) : 'anon'

        const subject:Node = view.graph.generateURI(
            URIUtils.getPrefix(parent.subject) + displayId + '$n?$')

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.displayId]: node.createStringNode(displayId)
        })

        if(name !== undefined) {
            view.graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        view.graph.insertProperties(parent.subject, {
            [ownershipPredicate]: subject
        })

        return new S3Identified(view, subject)
    }

}

function nameToID(name:string):string {

    // TODO
    return name.replace(/\s/, '_')

}

function extractPersistentIdentity(subject:Node, version:string|undefined) {
    if(version !== undefined) {
        return uri.substr(0, uri.length - version.length - 1)
    } else {
        return uri
    }
}

function extractID(subject:Node, version:string|undefined) {
    let tokens = uri.split('/')
    if(version !== undefined) {
        return tokens[tokens.length - 2]
    } else {
        return tokens[tokens.length - 1]
    }
}



