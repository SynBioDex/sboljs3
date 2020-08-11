import { Facade, triple, GraphView, Graph } from "rdfoo"
import isOwnershipRelation from "./isOwnershipRelation"

export default abstract class SBOLFacade extends Facade {

    view:GraphView

    constructor(graph:Graph, view:GraphView, uri:string) {
        super(graph, uri)
        this.view = view
    }

    hasProperty(predicate:string) {
        return this.graph.hasMatch(this.uri, predicate, null)
    }

    get owningObject():SBOLFacade|undefined {

        let ownageTriples = this.graph.match(null, null, this.uri)
                    .filter(t => isOwnershipRelation(this.graph, t))

        if(ownageTriples.length === 1) {
            return this.view.uriToFacade(triple.subjectUri(ownageTriples[0]) as string) as SBOLFacade|undefined
        }
    }

    get ownedObjects():Array<SBOLFacade> {

        let ownageTriples = this.graph.match(this.uri, null, null)
                    .filter(t => isOwnershipRelation(this.graph, t))

        return ownageTriples.map(triple.objectUri)
            .map(uri => this.view.uriToFacade(uri as string))
            .filter(o => o !== undefined) as SBOLFacade[]
    }

    isSiblingOf(other:SBOLFacade):boolean {

        let ourContainer = this.owningObject
        let theirContainer = other.owningObject

        if(!ourContainer) {
            if(!theirContainer) {
                return true
            } else {
                return false
            }
        } else {
            if(theirContainer && theirContainer.uri === ourContainer.uri) {
                return true
            } else {
                return false
            }
        }
    }

    getSiblings():Array<SBOLFacade> {

        let ourContainer = this.owningObject

        if(!ourContainer) {
            return []
        }

        let containedObjects = ourContainer.ownedObjects

        // remove us from the list
        //
        for(let i = 0; i < containedObjects.length; ++ i) {
            if(containedObjects[i].uri === this.uri) {
                containedObjects.splice(i, 1)
                break
            }
        }

        return containedObjects
    }

    destroy() {

        let toPurge:SBOLFacade[] = []

        add(this)

        for(let obj of toPurge) {
            this.graph.purgeSubject(obj.uri)
        }

        function add(o) {
            toPurge.push(o)

            let owned = o.ownedObjects

            for(let obj of owned) {
                add(obj)
            }
        }
    }

}

