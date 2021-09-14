import { Facade, triple, GraphView, Graph } from "rdfoo"
import isOwnershipRelation from "./isOwnershipRelation"
import { Node } from 'rdfoo'

export default abstract class SBOLFacade extends Facade {

    view:GraphView

    constructor(graph:Graph, view:GraphView, subject:Node) {
        super(graph, subject)
        this.view = view
    }

    hasProperty(predicate:string) {
        return this.graph.hasMatch(this.subject, predicate, null)
    }

    get owningObject():SBOLFacade|undefined {

        let ownageTriples = this.graph.match(null, null, this.subject)
                    .filter(t => isOwnershipRelation(this.graph, t))

        if(ownageTriples.length === 1) {
            return this.view.subjectToFacade(ownageTriples[0].subject)
        }
    }

    get ownedObjects():Array<SBOLFacade> {

        let ownageTriples = this.graph.match(this.subject, null, null)
                    .filter(t => isOwnershipRelation(this.graph, t))

        return ownageTriples.map(t => t.object)
            .map(uri => this.view.subjectToFacade(uri as string))
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
            if(theirContainer && theirContainer.subject.value === ourContainer.subject.value) {
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
            if(containedObjects[i].subject.value === this.subject.value) {
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
            this.graph.purgeSubject(obj.subject)
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

