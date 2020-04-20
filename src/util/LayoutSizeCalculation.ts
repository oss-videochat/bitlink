import {LayoutFinder} from "./LayoutFinder";

interface LayoutConfiguration {
    basis: string,
    maxWidth: string
    choices?: any[],
}

export function LayoutSizeCalculation(largeWidth: number, largeHeight: number, numDevices: number): LayoutConfiguration {
    const choices = [];
    const layoutConfig = LayoutFinder(numDevices);

    choices.push(layoutConfig);

    const basis = 1 / layoutConfig.devices_per_column;

    choices.push(basis);

    let calculatedWidth = basis * largeWidth;
    const thatWidthsHeight = calculatedWidth / (16 / 9);

    choices.push(`Calculated width ${calculatedWidth} has a height of ${thatWidthsHeight}`);

    if ((thatWidthsHeight * layoutConfig.columns) > largeHeight) {
        choices.push(`Calculated height is larger than largeHeight (${largeHeight}) so i taking the best width ${(largeHeight * (16 / 9))} and devideing by ${layoutConfig.columns}`);
        calculatedWidth = (largeHeight * (16 / 9)) / layoutConfig.columns;
        if (calculatedWidth * layoutConfig.devices <= largeWidth) { // if the div aspect ratio is so large (width is so much larger than height, we might as well keep them all on one line instead of using the layout config) unless this would exceed the width
            choices.push(`Total calculated width (${calculatedWidth * layoutConfig.devices}) would be less than the max width. So its going to be a one line.`);

            choices.push("Width based width: " + largeWidth / layoutConfig.devices);
            choices.push("Height based width: " + (16 * largeHeight) / (9 * layoutConfig.devices));

            calculatedWidth = Math.max( // this does some math to figure out that best width to used. It works, don't touch it. If you need to, here's a bit of explanation.
                Math.min( // each of these min functions are basically checking if divHeight > largeWidth or vice versa, if they are the same it doesn't matter. This one is divHeight < largeWidth.
                    largeWidth / layoutConfig.devices,  // each of the two expressions in the mins are deciding whether to base the width off of the smaller or larger dimension (x or y).
                    (16 * largeHeight) / 9
                ),
                Math.min( // largeHeight > largeWidth | we shouldn't ever hit this because of the logic above. If we do, it will likely need to be rotated because this is giving us the height dimension not width
                    largeHeight / layoutConfig.devices,
                    (16 * largeWidth) / 9
                ),
            );
        }
    }

    return {
        basis: calculatedWidth + "px",
        maxWidth: (100 / layoutConfig.devices_per_column) + "%",
        choices
    }

}
