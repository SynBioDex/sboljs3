
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

        const uri:string = view.graph.generateURI(uriPrefix + displayId + '$n?$')

        view.graph.insertProperties(uriPrefix, {
            [Predicates.a]: node.createUriNode(Types.SBOL3.Namespace),
            [Predicates.SBOL3.member]: node.createUriNode(uri)
        })

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.displayId]: node.createStringNode(displayId)
        })

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
                    displayId:string|undefined,
                    name:string|undefined):S3Identified {

        displayId = displayId ? nameToID(displayId) : 'anon'

        const uri:string = view.graph.generateURI(
            URIUtils.getPrefix(parent.uri) + displayId + '$n?$')

        let ns = parent.namespace

        if(ns !== undefined) {
            view.graph.insertProperties(ns.uri, {
                [Predicates.SBOL3.member]: node.createUriNode(uri)
            })
        }

        view.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.displayId]: node.createStringNode(displayId)
        })

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



