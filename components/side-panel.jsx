"use client"

import {
  buttonCancelClassNames,
  buttonClassNames
} from '@/components/look.js';
import {
  Dialog,
  Transition
} from '@headlessui/react';
import {
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/20/solid';
import {
  Fragment,
} from 'react';

export const SidePanel = props => {

  const open = props.open;
  const setOpen = props.setOpen;
  const cbSaveSidePanel = props.onSaveSidePanel;

  const children = props.children;
  const title = props.title;
  const loading = props.loading;
  const error = props.error;

  return (
    <Transition.Root
      show={open}
      as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            { title }
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        {
                          children
                        }
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4 gap-2">
                      <button
                        type="button"
                        className={ buttonCancelClassNames }
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={ cbSaveSidePanel }
                        className={ buttonClassNames }
                      >
                        Add
                        <PlusIcon
                          className={ `h-5 w-5 pointer-events-none ${ loading ? `animate-spin` : `` }` }
                          aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};