
import SXIdentified from './SXIdentified'
import SXLocation from './SXLocation'
import SXRange from './SXRange'
import SXIdentifiedFactory from './SXIdentifiedFactory'

import { node } from 'rdfoo'

import { Predicates, Types } from 'bioterms'
import SXOrientedLocation from './SXOrientedLocation';

export default class SXThingWithLocation extends SXIdentified {

    get locations():Array<SXLocation> {

        return this.getUriProperties(Predicates.SBOLX.location)
                   .map((uri:string) => this.view.uriToFacade(uri) as SXLocation)
    }

    get rangeLocations():Array<SXRange> {

        return this.locations.filter((location:SXIdentified) => {
            return location.objectType === Types.SBOLX.Range
        }).map((identified:SXIdentified) => {
            return new SXRange(this.view, identified.uri)
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

        const id:string = 'range'

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.view, Types.SBOLX.Range, this, Predicates.SBOLX.location, id, undefined, this.version)

        const range:SXRange = new SXRange(this.view, identified.uri)

        range.start = start
        range.end = end

        return range
    }

    addOrientedLocation():SXOrientedLocation {

        const loc:SXIdentified = SXIdentifiedFactory.createChild(this.view, Types.SBOLX.OrientedLocation, this, Predicates.SBOLX.location, 'location', undefined, this.version)

        return new SXOrientedLocation(loc.view, loc.uri)
    }

    setOrientation(orientation:string) {

        let hadOrientedLocation = false

        if(this.locations.length > 0) {
            for(let location of this.locations) {
                if(location instanceof SXOrientedLocation) {
                    location.orientation = orientation
                    hadOrientedLocation = true
                }
            }
        }

        if(hadOrientedLocation)
            return

        let loc = this.addOrientedLocation()
        loc.orientation = orientation
    }

    getOrientation():string|undefined {

        for (let location of this.locations) {
            if (location instanceof SXOrientedLocation) {
                return location.orientation
            }
        }

        return undefined
    }

}
