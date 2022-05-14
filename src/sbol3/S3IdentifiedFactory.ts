
import S3Identified from "./S3Identified";
import { Predicates, Types } from 'bioterms'
import { node, Node } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView'
import URIUtils from "../URIUtils";

export default class S3IdentifiedFactory {
    
    static createTopLevel(view:SBOL3GraphView,
                          type:string,
                          uriPrefix:string,
                          displayId:string|undefined,
                          name:string|undefined):S3Identified {

        displayId = displayId ? nameToID(displayId) : 'anon'

        const subject:Node = node.createUriNode(view.graph.generateURI(uriPrefix + displayId + '$n?$'))

        view.graph.insertProperties(subject, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.displayId]: node.createStringNode(displayId),
            [Predicates.SBOL3.hasNamespace]: node.createUriNode(uriPrefix)
        })

        if(name !== undefined) {
            view.graph.insertProperties(subject, {
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

        const subject:Node = node.createUriNode( view.graph.generateURI(
            parent.namespace + parent.displayId + '/' + displayId + '$n?$') )

        view.graph.insertProperties(subject, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL3.displayId]: node.createStringNode(displayId),
            [Predicates.SBOL3.hasNamespace]: node.createUriNode(parent.namespace)
        })

        if(name !== undefined) {
            view.graph.insertProperties(subject, {
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

