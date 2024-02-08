"use client"

import React from 'react';

export const AdminTable = () => {
    const dummyData = [
        { id: 1, name: 'John Doe', age: 25 },
        { id: 2, name: 'Jane Smith', age: 30 },
        { id: 3, name: 'Bob Johnson', age: 35 },
    ];

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                </tr>
            </thead>
            <tbody>
                {dummyData.map((data) => (
                    <tr key={data.id}>
                        <td>{data.id}</td>
                        <td>{data.name}</td>
                        <td>{data.age}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
