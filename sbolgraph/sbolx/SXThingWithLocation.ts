
import SXIdentified from './SXIdentified'
import SXLocation from './SXLocation'
import SXRange from './SXRange'
import SXIdentifiedFactory from './SXIdentifiedFactory'

import * as node from '../node'

import { Predicates, Types } from 'sbolterms'

export default class SXThingWithLocation extends SXIdentified {

    get locations():Array<SXLocation> {

        return this.getUriProperties(Predicates.SBOLX.hasLocation)
                   .map((uri:string) => this.graph.uriToFacade(uri) as SXLocation)
    }

    get rangeLocations():Array<SXRange> {

        return this.locations.filter((location:SXIdentified) => {
            return location.objectType === Types.SBOLX.Range
        }).map((identified:SXIdentified) => {
            return new SXRange(this.graph, identified.uri)
        })

    }

    get rangeMin():number|null {

        var n:number = Number.MAX_VALUE

        this.rangeLocations.forEach((range:SXRange) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start < n)
                n = start

            if(end !== undefined && end < n)
                n = end
        })

        return n === Number.MAX_VALUE ? null : n
    }

    get rangeMax():number|null {

        var n:number = Number.MIN_VALUE

        this.rangeLocations.forEach((range:SXRange) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start > n)
                n = start

            if(end !== undefined && end > n)
                n = end
        })

        return n === Number.MIN_VALUE ? null : n
    }

    hasFixedLocation():boolean {

        const locations = this.locations

        for(var i = 0; i < locations.length; ++ i) {

            if(locations[i].isFixed())
                return true

        }

        return false
    }

    addRange(start:number, end:number):SXRange {

        const id:string = 'range_' + name

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.graph, Types.SBOLX.Range, this, id, undefined, this.version)

        this.graph.add(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOLX.hasLocation), node.createUriNode(identified.uri))

        const range:SXRange = new SXRange(this.graph, identified.uri)

        range.start = start
        range.end = end

        return range
    }

}
