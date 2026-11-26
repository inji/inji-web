import React from "react";
import {render, screen} from "@testing-library/react";
import {FlatList} from "../../../../components/Common/List/FlatList";

describe("FlatList Component", () => {
    type Item = {
        id: string;
        name: string;
    }
    const sampleData: Item[] = [
        {id: "1", name: "Item 1"},
        {id: "2", name: "Item 2"},
        {id: "3", name: "Item 3"}
    ];

    const keyExtractor = (item: Item) => item.id;
    const renderItem = (item: Item) => <div>{item.name}</div>;

    it('should match the snapshot', () => {
        const {asFragment} = render(
            <FlatList
                data={sampleData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                testId="flatlist"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders all items", () => {
        render(
            <FlatList
                data={sampleData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                testId="flatlist"
            />
        );
        sampleData.forEach(({name}) => {
            expect(screen.getByText(name)).toBeInTheDocument();
        });
    });

    it("renders fallback message if no items", () => {
        render(
            <FlatList
                data={[]}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                testId="flatlist"
            />
        );
        expect(screen.getByText("No items available")).toBeInTheDocument();
        expect(screen.getByTestId("empty-list")).toHaveTextContent("No items available");
    });

    it("renders custom empty state if provided", () => {
        render(
            <FlatList
                data={[]}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                testId="flatlist"
                onEmpty={<div data-testid="custom-empty">Nothing here</div>}
            />
        );
        expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
        expect(screen.getByText("Nothing here")).toBeInTheDocument();
    });

    it("applies correct responsive grid classes", () => {
        render(
            <FlatList
                data={sampleData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                testId="flatlist"
            />
        );
        const list = screen.getByTestId("flatlist");
        expect(list.className).toMatch(/grid-cols-\[repeat\(auto-fill,minmax\(min\(100%,22rem\),1fr\)\)\]/);
    });
});
