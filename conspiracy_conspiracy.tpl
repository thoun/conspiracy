{OVERALL_GAME_HEADER}

<div id="score">
    <table>
        <thead>
            <tr>
                <th></th>
                <th id="th-lords-score" class="lords-score"></th>
                <th id="th-locations-score" class="locations-score"></th>
                <th id="th-coalition-score" class="coalition-score"></th>
                <th id="th-masterPearl-score" class="masterPearl-score"></th>
                <th></th>
            </tr>
        </thead>
        <tbody id="score-table-body">
        </tbody>
    </table>
</div>

<div id="full-table">

    <div id="stacks">
        <div id="lord-stacks" class="stacks whiteblock">
            <div id="lord-hidden-pile" class="hidden-pile lord-hidden-pile-tooltip">
                <div role="button" id="lord-hidden-pile1" class="button left-radius lord-hidden-pile-tooltip" data-number="1">1</div>
                <div role="button" id="lord-hidden-pile2" class="button lord-hidden-pile-tooltip" data-number="2">2</div>
                <div role="button" id="lord-hidden-pile3" class="button right-radius lord-hidden-pile-tooltip" data-number="3">3</div>
            </div>
            <div id="remaining-lord-counter" class="remaining-counter"></div>
            <div id="lord-visible-stocks">
                <div id="lord-visible-stock1"></div>
                <div id="lord-visible-stock2"></div>
                <div id="lord-visible-stock3"></div>
                <div id="lord-visible-stock4"></div>
                <div id="lord-visible-stock5"></div>
            </div>
        </div>
        <div id="lord-pick" class="pick-stock whiteblock">
            <div id="lord-pick-stock"></div>
        </div>

        <div id="location-stacks" class="stacks whiteblock">
            <div id="location-hidden-pile" class="hidden-pile location-hidden-pile-tooltip">
                <div role="button" id="location-hidden-pile1" class="button left-radius location-hidden-pile-tooltip" data-number="1">1</div>
                <div role="button" id="location-hidden-pile2" class="button location-hidden-pile-tooltip" data-number="2">2</div>
                <div role="button" id="location-hidden-pile3" class="button right-radius location-hidden-pile-tooltip" data-number="3">3</div>
            </div>
            <div id="remaining-location-counter" class="remaining-counter"></div>
            <div id="location-visible-stock"></div>
        </div>
        <div id="location-pick" class="pick-stock whiteblock">
            <div id="location-pick-stock"></div>
        </div>
    </div>

    <div id="players-tables">
    </div>
</div>

{OVERALL_GAME_FOOTER}
